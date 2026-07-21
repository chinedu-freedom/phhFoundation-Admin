import { prisma } from "@/lib/db";
import SubscribersManager from "./SubscribersManager";

export const metadata = {
  title: "Newsletter Subscribers | HH Admin",
};

export default async function AdminSubscribersPage() {
  const rawSubscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const subscribers = rawSubscribers.map(s => ({
    ...s,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Newsletter Subscribers
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor your community subscribers list. Export email contacts as a CSV sheet for Zoho Campaigns or Mailchimp campaigns.
        </p>
      </div>

      <SubscribersManager initialSubscribers={subscribers} />
    </div>
  );
}
