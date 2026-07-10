"use server";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/zohoMailer";
import { revalidatePath } from "next/cache";

export async function updateVolunteerStatusAction(id, status) {
  if (!id || !status) {
    return { error: "ID and status are required." };
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return { error: "Invalid status value." };
  }

  try {
    const application = await prisma.volunteerApplication.update({
      where: { id },
      data: { status },
    });

    // Send status notification email to the volunteer
    const isApproved = status === "APPROVED";
    const subject = isApproved
      ? "Volunteer Application Approved! - HH Foundation"
      : "Update on your Volunteer Application - HH Foundation";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: bold; color: #0d9488;">HH Foundation</span>
        </div>
        <h2 style="color: #1f2937; margin-bottom: 12px;">Hello ${application.name},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
          Thank you for applying to volunteer with us. We have reviewed your application and the details you submitted regarding your availability and skillsets.
        </p>
        
        ${
          isApproved
            ? `
          <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #0f766e; font-size: 16px;">Status: Approved</h3>
            <p style="margin: 0; font-size: 14px; color: #115e59;">
              Welcome to the family! We are thrilled to have you onboard. Our coordinator will contact you shortly via phone or email to schedule your onboarding session and allocate you to upcoming community outreaches.
            </p>
          </div>
          `
            : `
          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #991b1b; font-size: 16px;">Status: Declined</h3>
            <p style="margin: 0; font-size: 14px; color: #7f1d1d;">
              At this time, we are unable to match your current skill profile or availability with our immediate campaigns. We will keep your resume on file and reach out if future projects align.
            </p>
          </div>
          `
        }

        <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 24px;">
          Warmest regards,<br />
          <strong>The HH Foundation Team</strong>
        </p>
      </div>
    `;

    await sendEmail({
      to: application.email,
      subject,
      html: htmlContent,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: `VOLUNTEER_STATUS_${status}`,
        details: `Volunteer application for ${application.name} (${application.email}) marked as ${status}.`,
        userEmail: application.email,
      },
    });

    revalidatePath("/admin/volunteers");
    return { success: true, application };
  } catch (error) {
    console.error("Update volunteer status error:", error);
    return { error: "Failed to update volunteer status." };
  }
}

export async function createVolunteerApplicationAction(formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const location = formData.get("location")?.toString().trim();
  const skills = formData.get("skills")?.toString().trim();
  const availability = formData.get("availability")?.toString().trim();
  const motivation = formData.get("motivation")?.toString().trim();

  if (!name || !email || !phone || !location || !skills || !availability) {
    return { error: "All fields are required to process your application." };
  }

  try {
    const app = await prisma.volunteerApplication.create({
      data: {
        name,
        email,
        phone,
        location,
        skills,
        availability,
        motivation,
        status: "PENDING",
      },
    });

    // Send thank you email to application
    const thankYouHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f1f1f1; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: bold; color: #0d9488;">HH Foundation</span>
        </div>
        <h2>Dear ${name},</h2>
        <p>Thank you for submitting your application to volunteer with the HH Foundation.</p>
        <p>Our team will review your application details. You will receive an email update once your status has been updated by the administrator.</p>
        <p>Best regards,<br/>HH Foundation</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Volunteer Application Received - HH Foundation",
      html: thankYouHtml,
    });

    return { success: true, id: app.id };
  } catch (error) {
    console.error("Create volunteer application error:", error);
    return { error: "Could not submit application. Please try again." };
  }
}

