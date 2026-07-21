import { prisma } from "@/lib/db";
import TeamClient from "./TeamClient";

export const metadata = {
  title: "Team Members | HH Admin",
};

export default async function AdminTeamPage() {
  const rawMembers = await prisma.teamMember.findMany({
    orderBy: { order: "asc" },
  });

  const members = rawMembers.map((m) => ({
    ...m,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Team Members
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage executive leadership, board members, and team profiles displayed on the About Us page.
        </p>
      </div>

      <TeamClient initialMembers={members} />
    </div>
  );
}
