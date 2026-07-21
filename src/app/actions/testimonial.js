"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertTestimonialAction(prevState, formData) {
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const role = formData.get("role")?.toString().trim();
  const quote = formData.get("quote")?.toString().trim();
  const image = formData.get("image")?.toString().trim() || null;
  const status = formData.get("status") === "true";

  if (!name || !role || !quote) {
    return { error: "Name, role, and quote are required." };
  }

  try {
    if (id) {
      await prisma.testimonial.update({
        where: { id },
        data: { name, role, quote, image, status },
      });
    } else {
      await prisma.testimonial.create({
        data: { name, role, quote, image, status },
      });
    }

    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    console.error("Upsert testimonial error:", error);
    return { error: "Failed to save testimonial." };
  }
}

export async function toggleTestimonialStatusAction(id, currentStatus) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.testimonial.update({
      where: { id },
      data: { status: !currentStatus },
    });

    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    console.error("Toggle testimonial error:", error);
    return { error: "Failed to toggle status." };
  }
}

export async function deleteTestimonialAction(id) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.testimonial.delete({
      where: { id },
    });

    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error) {
    console.error("Delete testimonial error:", error);
    return { error: "Failed to delete testimonial." };
  }
}
