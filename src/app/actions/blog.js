"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendBlogNotification } from "@/lib/zohoMailer";

export async function upsertBlogAction(prevState, formData) {
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const image = formData.get("image")?.toString().trim() || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600";
  const category = formData.get("category")?.toString().trim() || "Community";
  const authorName = formData.get("authorName")?.toString().trim() || "HH Foundation";
  const authorEmail = formData.get("authorEmail")?.toString().trim() || "hephzibahhumanitarianf@gmail.com";
  const status = formData.get("status")?.toString() || "DRAFT";

  if (!title || !content) {
    return { error: "Title and content are required." };
  }

  const slug = `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    let shouldNotify = false;
    let postObj = null;

    if (id) {
      // Edit Post
      const existing = await prisma.blogPost.findUnique({
        where: { id },
      });
      if (existing && existing.status !== "PUBLISHED" && status === "PUBLISHED") {
        shouldNotify = true;
      }

      postObj = await prisma.blogPost.update({
        where: { id },
        data: {
          title,
          content,
          image,
          category,
          authorName,
          authorEmail,
          status,
        },
      });
    } else {
      // Create Post
      if (status === "PUBLISHED") {
        shouldNotify = true;
      }
      postObj = await prisma.blogPost.create({
        data: {
          title,
          slug,
          content,
          image,
          category,
          authorName,
          authorEmail,
          status,
        },
      });
    }

    if (shouldNotify && postObj) {
      sendBlogNotification(postObj).catch(console.error);
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Upsert blog error:", error);
    return { error: "Database error saving blog post. Please check input data." };
  }
}

export async function deleteBlogAction(id) {
  if (!id) return { error: "ID is required." };

  try {
    await prisma.blogPost.delete({
      where: { id },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error("Delete blog error:", error);
    return { error: "Failed to delete blog post." };
  }
}

