import { prisma } from "@/lib/db";
import BlogManager from "./BlogManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage Blog Posts | HH Admin",
};

export default async function AdminBlogPage() {
  const rawPosts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Convert Date objects to JSON-compatible types for the client component
  const formattedPosts = rawPosts.map((post) => ({
    ...post,
    createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
    updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : post.updatedAt,
  }));

  return (
    <BlogManager initialPosts={formattedPosts} />
  );
}
