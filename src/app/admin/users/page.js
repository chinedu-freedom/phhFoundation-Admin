import { prisma } from "@/lib/db";
import UsersClient from "./UsersClient";

export const metadata = {
  title: "Admin Accounts | HH Admin",
};

export default async function AdminUsersPage() {
  const rawUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const users = rawUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Admin Accounts
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage system administrator credentials and staff access privileges.
        </p>
      </div>

      <UsersClient initialUsers={users} />
    </div>
  );
}
