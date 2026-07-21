"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteSubscriberAction(id) {
  if (!id) {
    return { error: "Subscriber ID is required." };
  }

  try {
    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    revalidatePath("/admin/subscribers");
    return { success: true };
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return { error: "Failed to delete subscriber." };
  }
}
