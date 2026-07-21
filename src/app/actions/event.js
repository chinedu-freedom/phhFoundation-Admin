"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEventNotification } from "@/lib/zohoMailer";

export async function upsertEventAction(prevState, formData) {
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const dateStr = formData.get("date")?.toString();
  const venue = formData.get("venue")?.toString().trim();
  const image = formData.get("image")?.toString().trim() || null;
  const registrationRequired = formData.get("registrationRequired") === "true";
  const status = formData.get("status")?.toString() || "UPCOMING";

  if (!title || !description || !dateStr || !venue) {
    return { error: "Title, description, date, and venue are required." };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { error: "Please enter a valid date and time." };
  }

  try {
    let shouldNotify = false;
    let eventObj = null;

    if (id) {
      // Edit Event
      const existing = await prisma.event.findUnique({
        where: { id },
      });
      if (existing && existing.status !== "UPCOMING" && status === "UPCOMING") {
        shouldNotify = true;
      }

      eventObj = await prisma.event.update({
        where: { id },
        data: {
          title,
          description,
          date,
          venue,
          image,
          registrationRequired,
          status,
        },
      });
    } else {
      // Create Event
      if (status === "UPCOMING") {
        shouldNotify = true;
      }
      eventObj = await prisma.event.create({
        data: {
          title,
          description,
          date,
          venue,
          image,
          registrationRequired,
          status,
          attendeesCount: 0,
        },
      });
    }

    if (shouldNotify && eventObj) {
      sendEventNotification(eventObj).catch(console.error);
    }

    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    console.error("Upsert event error:", error);
    return { error: "Database error saving event. Please try again." };
  }
}

export async function deleteEventAction(id) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.event.delete({
      where: { id },
    });

    revalidatePath("/admin/events");
    revalidatePath("/events");
    return { success: true };
  } catch (error) {
    console.error("Delete event error:", error);
    return { error: "Failed to delete event. Please try again." };
  }
}

export async function rsvpEventAction(eventId, name, email) {
  if (!eventId || !name || !email) {
    return { error: "Event ID, name, and email are required." };
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return { error: "Event not found." };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        attendeesCount: {
          increment: 1
        }
      }
    });

    // Write to audit log
    await prisma.auditLog.create({
      data: {
        action: "EVENT_RSVP",
        details: `User ${name} (${email}) RSVPed for event: ${event.title}`,
        userEmail: email
      }
    });

    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { success: true };
  } catch (error) {
    console.error("RSVP error:", error);
    return { error: "Could not register RSVP. Please try again." };
  }
}

