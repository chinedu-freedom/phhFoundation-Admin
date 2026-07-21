import { prisma } from "@/lib/db";
import DonationsManager from "./DonationsManager";

export const metadata = {
  title: "Manage Donations | HH Admin",
};

export default async function AdminDonationsPage() {
  const [rawDonations, rawCampaigns] = await Promise.all([
    prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          select: { id: true, title: true },
        },
      },
    }),
    prisma.campaign.findMany({
      select: { id: true, title: true },
    }),
  ]);

  const donations = rawDonations.map((d) => ({
    ...d,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
          Donations
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Track transaction references, check payment statuses, and reconcile manual transfers.
        </p>
      </div>

      <DonationsManager initialDonations={donations} campaigns={rawCampaigns} />
    </div>
  );
}
