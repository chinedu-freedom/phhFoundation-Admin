import { prisma } from "@/lib/db";
import VolunteersManager from "./VolunteersManager";

export const metadata = {
  title: "Manage Volunteers | HH Admin",
};

export default async function AdminVolunteersPage() {
  const rawVolunteers = await prisma.volunteerApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
  const volunteers = rawVolunteers.map(v => ({
    ...v,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Volunteer Applications
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Review, approve, or decline applications from individuals wanting to join local outreach operations.
        </p>
      </div>

      <VolunteersManager initialVolunteers={volunteers} />
    </div>
  );
}
