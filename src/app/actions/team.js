"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function upsertTeamMemberAction(prevState, formData) {
  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();
  const role = formData.get("role")?.toString().trim();
  const bio = formData.get("bio")?.toString().trim() || null;
  const image = formData.get("image")?.toString().trim() || null;
  const linkedin = formData.get("linkedin")?.toString().trim() || null;
  const orderStr = formData.get("order")?.toString() || "0";
  const order = parseInt(orderStr, 10) || 0;

  if (!name || !role) {
    return { error: "Name and role are required." };
  }

  try {
    const existingOrder = await prisma.teamMember.findFirst({
      where: {
        order,
        ...(id ? { id: { not: id } } : {}),
      },
    });

    if (existingOrder) {
      return {
        error: `Order #${order} is already assigned to "${existingOrder.name}". Each team member must have a unique order number.`,
      };
    }

    if (id) {
      await prisma.teamMember.update({
        where: { id },
        data: { name, role, bio, image, linkedin, order },
      });
    } else {
      await prisma.teamMember.create({
        data: { name, role, bio, image, linkedin, order },
      });
    }

    revalidatePath("/admin/team");
    return { success: true };
  } catch (error) {
    console.error("Upsert team member error:", error);
    return { error: "Failed to save team member." };
  }
}

export async function deleteTeamMemberAction(id) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.teamMember.delete({
      where: { id },
    });

    revalidatePath("/admin/team");
    return { success: true };
  } catch (error) {
    console.error("Delete team member error:", error);
    return { error: "Failed to delete team member." };
  }
}
