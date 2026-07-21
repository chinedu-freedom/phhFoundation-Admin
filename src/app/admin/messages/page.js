import { prisma } from "@/lib/db";
import MessagesClient from "./MessagesClient";

export const metadata = {
  title: "Contact Messages | HH Admin",
};

export default async function AdminMessagesPage() {
  const rawMessages = await prisma.auditLog.findMany({
    where: { action: "CONTACT_FORM_SUBMIT" },
    orderBy: { createdAt: "desc" },
  });

  const messages = rawMessages.map((m) => ({
    ...m,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Contact Messages
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Review and respond to inquiries submitted through the website contact form.
        </p>
      </div>

      <MessagesClient initialMessages={messages} />
    </div>
  );
}
