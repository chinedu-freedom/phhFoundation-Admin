"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitContactForm(prevState, formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !subject || !message) {
    return { error: "All fields are required." };
  }

  try {
    await prisma.auditLog.create({
      data: {
        action: "CONTACT_FORM_SUBMIT",
        userEmail: email,
        details: `Name: ${name} | Subject: ${subject} | Message: ${message.slice(0, 300)}`,
      },
    });

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error) {
    console.error("Contact Form error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function deleteAuditLogAction(id) {
  if (!id) return { error: "Log ID is required." };

  try {
    await prisma.auditLog.delete({
      where: { id },
    });

    revalidatePath("/admin/messages");
    revalidatePath("/admin/audit-logs");
    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error) {
    console.error("Delete log error:", error);
    return { error: "Failed to delete log entry." };
  }
}
