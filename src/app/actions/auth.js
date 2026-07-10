"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { encrypt, logoutSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function loginAction(prevState, formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { error: "Invalid email or password." };
    }

    if (user.role !== "ADMIN") {
      return { error: "Unauthorized access. Admin role required." };
    }

    // Encrypt session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const session = await encrypt({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      expires,
    });

    // Save cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires,
      sameSite: "lax",
      path: "/",
    });

    return { success: true, user: { name: user.name, email: user.email, role: user.role } };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export async function registerAction(prevState, formData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Encrypt session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      expires,
    });

    // Save cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires,
      sameSite: "lax",
      path: "/",
    });

    return { success: true, user: { name: user.name, email: user.email, role: user.role } };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "An error occurred while creating your account. Please try again." };
  }
}

export async function logoutAction() {
  await logoutSession();
  return { success: true };
}
