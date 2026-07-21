import { prisma } from "@/lib/db";
import AuditLogsClient from "./AuditLogsClient";

export const metadata = {
  title: "Audit Logs | HH Admin",
};

export default async function AdminAuditLogsPage() {
  const rawLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const logs = rawLogs.map((l) => ({
    ...l,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          System Audit Logs
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Monitor system actions, form submissions, security activity, and user events across the platform.
        </p>
      </div>

      <AuditLogsClient initialLogs={logs} />
    </div>
  );
}
