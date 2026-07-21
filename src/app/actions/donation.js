"use server";

import { prisma } from "@/lib/db";
import { sendEmail, getDonationThankYouHTML } from "@/lib/zohoMailer";
import { getSession } from "@/lib/auth";

export async function createDonationAction(prevState, formData) {
  const amountStr = formData.get("amount")?.toString();
  const donorName = formData.get("donorName")?.toString().trim();
  const donorEmail = formData.get("donorEmail")?.toString().trim();
  const isAnonymous = formData.get("isAnonymous") === "true";
  const campaignId = formData.get("campaignId")?.toString();
  const paymentMethod = formData.get("paymentMethod")?.toString() || "PAYSTACK";

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Please enter a valid donation amount." };
  }

  if (!isAnonymous && (!donorName || !donorEmail)) {
    return { error: "Name and email are required unless donating anonymously." };
  }

  try {
    const session = await getSession();
    const reference = `HH-DON-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const donation = await prisma.donation.create({
      data: {
        amount,
        donorName: isAnonymous ? "Anonymous Donor" : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        isAnonymous,
        paymentMethod,
        reference,
        status: "PENDING",
        campaignId: campaignId || null,
        userId: session ? session.userId : null,
      },
    });

    return { success: true, reference, donationId: donation.id };
  } catch (error) {
    console.error("Create donation error:", error);
    return { error: "Could not initialize donation. Please try again." };
  }
}

export async function confirmDonationAction(reference) {
  if (!reference) {
    return { error: "Transaction reference is required." };
  }

  try {
    const donation = await prisma.donation.findUnique({
      where: { reference },
      include: { campaign: true },
    });

    if (!donation) {
      return { error: "Donation transaction not found." };
    }

    if (donation.status === "SUCCESSFUL") {
      return { success: true, message: "Donation already processed." };
    }

    // 1. Update donation status
    const updatedDonation = await prisma.donation.update({
      where: { reference },
      data: { status: "SUCCESSFUL" },
    });

    // 2. Increment campaign raisedAmount if associated
    if (donation.campaignId) {
      await prisma.campaign.update({
        where: { id: donation.campaignId },
        data: {
          raisedAmount: {
            increment: donation.amount,
          },
        },
      });
    }

    // 3. Send email via Zoho (if email was provided)
    const emailToUse = donation.isAnonymous ? null : donation.donorEmail;
    if (emailToUse) {
      const emailHtml = getDonationThankYouHTML({
        donorName: donation.isAnonymous ? "Valued Supporter" : donation.donorName,
        amount: donation.amount,
        campaignTitle: donation.campaign?.title || "HH Foundation General Fund",
        reference: donation.reference,
      });

      await sendEmail({
        to: emailToUse,
        subject: `Thank you for your donation! - Reference ${donation.reference}`,
        html: emailHtml,
      });
    }

    // 4. Log audit log
    await prisma.auditLog.create({
      data: {
        action: "DONATION_RECEIVED",
        details: `Donation of ₦${donation.amount} received from ${donation.isAnonymous ? "Anonymous" : donation.donorName} for ${donation.campaign?.title || "General Fund"}. Ref: ${donation.reference}`,
        userEmail: donation.donorEmail || "anonymous@hephzibahhumanitarianf.org",
      },
    });

    return { success: true, donation: updatedDonation };
  } catch (error) {
    console.error("Confirm donation error:", error);
    return { error: "Error finalizing donation status." };
  }
}

