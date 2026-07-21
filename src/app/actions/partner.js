"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertPartnerAction(prevState, formData) {
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const logoUrl = formData.get("logoUrl")?.toString().trim();
  const websiteUrl = formData.get("websiteUrl")?.toString().trim() || null;

  if (!name || !logoUrl) {
    return { error: "Partner name and logo URL are required." };
  }

  try {
    if (id) {
      await prisma.partner.update({
        where: { id },
        data: { name, logoUrl, websiteUrl },
      });
    } else {
      await prisma.partner.create({
        data: { name, logoUrl, websiteUrl },
      });
    }

    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error) {
    console.error("Upsert partner error:", error);
    return { error: "Failed to save partner." };
  }
}

export async function deletePartnerAction(id) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.partner.delete({
      where: { id },
    });

    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error) {
    console.error("Delete partner error:", error);
    return { error: "Failed to delete partner." };
  }
}
