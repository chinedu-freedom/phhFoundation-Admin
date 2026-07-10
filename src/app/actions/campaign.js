"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertCampaignAction(prevState, formData) {
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const image = formData.get("image")?.toString().trim() || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600";
  const targetAmountStr = formData.get("targetAmount")?.toString();
  const status = formData.get("status")?.toString() || "DRAFT";

  if (!title || !description || !targetAmountStr) {
    return { error: "Title, description, and target amount are required." };
  }

  const targetAmount = parseFloat(targetAmountStr);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    return { error: "Please enter a valid target amount." };
  }

  const slug = `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    if (id) {
      // Edit Campaign
      await prisma.campaign.update({
        where: { id },
        data: {
          title,
          description,
          image,
          targetAmount,
          status,
        },
      });
    } else {
      // Create Campaign
      await prisma.campaign.create({
        data: {
          title,
          slug,
          description,
          image,
          targetAmount,
          status,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (error) {
    console.error("Upsert campaign error:", error);
    return { error: "Database error saving campaign. Check for unique titles." };
  }
}

export async function deleteCampaignAction(id) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.campaign.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (error) {
    console.error("Delete campaign error:", error);
    return { error: "Failed to delete campaign. It might be referenced by donations." };
  }
}
