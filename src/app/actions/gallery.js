"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addGalleryImageAction(prevState, formData) {
  const url = formData.get("url")?.toString().trim();
  const caption = formData.get("caption")?.toString().trim() || null;
  const album = formData.get("album")?.toString().trim() || "Outreaches";

  if (!url) {
    return { error: "Image URL is required." };
  }

  try {
    await prisma.galleryImage.create({
      data: {
        url,
        caption,
        album,
      },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    console.error("Add gallery image error:", error);
    return { error: "Failed to save gallery image to database." };
  }
}

export async function deleteGalleryImageAction(id) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.galleryImage.delete({
      where: { id },
    });

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    console.error("Delete gallery image error:", error);
    return { error: "Failed to delete gallery image." };
  }
}
