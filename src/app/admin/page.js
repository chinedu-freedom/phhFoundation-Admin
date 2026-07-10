import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Query statistical aggregates and lists from Prisma
  const [
    donationsCount,
    donationsSumResult,
    activeCampaignsCount,
    volunteersCount,
    rawRecentDonations,
    rawRecentVolunteers
  ] = await Promise.all([
    prisma.donation.count(),
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESSFUL" },
    }),
    prisma.campaign.count({
      where: { status: "ACTIVE" },
    }),
    prisma.volunteerApplication.count(),
    prisma.donation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          select: { title: true },
        },
      },
    }),
    prisma.volunteerApplication.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const recentDonations = rawRecentDonations.map((d) => ({
    ...d,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
  }));

  const recentVolunteers = rawRecentVolunteers.map((v) => ({
    ...v,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt,
  }));

  const totalFundsRaised = donationsSumResult._sum.amount || 0;

  // Generate last 7 days of trend data for the area chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentDonationsForChart = await prisma.donation.findMany({
    where: {
      status: "SUCCESSFUL",
      createdAt: {
        gte: sevenDaysAgo
      }
    },
    select: {
      amount: true,
      createdAt: true
    }
  });

  const recentVolunteersForChart = await prisma.volunteerApplication.findMany({
    where: {
      createdAt: {
        gte: sevenDaysAgo
      }
    },
    select: {
      createdAt: true
    }
  });

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const chartData = last7Days.map(date => {
    const dateStr = date.toDateString();
    const donationsSum = recentDonationsForChart
      .filter(d => new Date(d.createdAt).toDateString() === dateStr)
      .reduce((sum, d) => sum + d.amount, 0);

    const volunteersCountVal = recentVolunteersForChart
      .filter(v => new Date(v.createdAt).toDateString() === dateStr)
      .length;

    return {
      name: daysOfWeek[date.getDay()],
      Donations: donationsSum,
      Volunteers: volunteersCountVal
    };
  });

  const stats = {
    donationsCount,
    totalFundsRaised,
    activeCampaignsCount,
    volunteersCount,
    recentDonations,
    recentVolunteers,
    chartData
  };

  return <DashboardClient initialStats={stats} />;
}
