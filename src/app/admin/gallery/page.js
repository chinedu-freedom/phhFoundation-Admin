import { prisma } from "@/lib/db";
import GalleryManager from "./GalleryManager";

export const metadata = {
  title: "Gallery Administration | HH Foundation",
};

export default async function AdminGalleryPage() {
  const rawImages = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize records
  const serializedImages = rawImages.map((img) => ({
    ...img,
    createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
  }));

  return (
    <GalleryManager initialImages={serializedImages} />
  );
}
