"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUserAction(prevState, formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() || "USER";

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "User with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "USER",
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Create user error:", error);
    return { error: "Failed to create user account." };
  }
}

export async function updateUserRoleAction(userId, role) {
  if (!userId || !role) return { error: "User ID and role are required." };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role === "ADMIN" ? "ADMIN" : "USER" },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Update user role error:", error);
    return { error: "Failed to update user role." };
  }
}

export async function deleteUserAction(userId) {
  if (!userId) return { error: "User ID is required." };

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user account." };
  }
}
