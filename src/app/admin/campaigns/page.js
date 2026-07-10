import { prisma } from "@/lib/db";
import CampaignManager from "./CampaignManager";

export const metadata = {
  title: "Manage Campaigns | HH Admin",
};

export default async function AdminCampaignsPage() {
  const rawCampaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
  const campaigns = rawCampaigns.map((c) => ({
    ...c,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
  }));

  return (
    <CampaignManager initialCampaigns={campaigns} />
  );
}
