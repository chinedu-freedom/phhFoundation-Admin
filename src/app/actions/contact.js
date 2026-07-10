"use server";

import { prisma } from "@/lib/db";

export async function submitContactForm(prevState, formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !subject || !message) {
    return { error: "All fields are required." };
  }

  try {
    // Log the contact form submission to the AuditLog database table
    await prisma.auditLog.create({
      data: {
        action: "CONTACT_FORM_SUBMIT",
        userEmail: email,
        details: `Name: ${name} | Subject: ${subject} | Message: ${message.slice(0, 150)}...`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Contact Form error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}
