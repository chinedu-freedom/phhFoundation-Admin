import { prisma } from "@/lib/db";
import TestimonialsClient from "./TestimonialsClient";

export const metadata = {
  title: "Testimonials | HH Admin",
};

export default async function AdminTestimonialsPage() {
  const rawTestimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  const testimonials = rawTestimonials.map((t) => ({
    ...t,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Testimonials
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage beneficiary stories and quotes showcased on the foundation website.
        </p>
      </div>

      <TestimonialsClient initialTestimonials={testimonials} />
    </div>
  );
}
