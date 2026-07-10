import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  Heart,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Hash
} from "lucide-react";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Donation Details | HH Admin`,
  };
}

export default async function DonationDetailsPage({ params }) {
  const { id } = await params;

  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      campaign: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!donation) {
    notFound();
  }

  const progressPercent = donation.campaign
    ? Math.min(
        100,
        Math.round((donation.campaign.raisedAmount / donation.campaign.targetAmount) * 100)
      )
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Navigation & Title */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/donations"
          className="inline-flex w-fit items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-855 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Donations
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              Donation Details
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Complete transaction overview and campaign association.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-sm font-bold text-zinc-650 dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-400 shadow-sm">
            ID: {donation.id}
          </div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (Main Donation & Donor Details) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Donation Summary Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
              Transaction Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                  Amount
                </span>
                <div className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-white">
                  ₦{donation.amount.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500">
                  Status
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    SUCCESSFUL
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500">
                  Reference Code
                </span>
                <div className="mt-1 flex items-center gap-2 font-mono text-sm font-bold text-zinc-900 dark:text-white">
                  <Hash className="h-4 w-4 text-zinc-400" />
                  {donation.reference}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500">
                  Date & Time
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-755 dark:text-zinc-300">
                  <Calendar className="h-4 w-4 text-zinc-400" />
                  {new Date(donation.createdAt).toLocaleString("en-US", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Donor Info Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Donor Information
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xxs font-bold ${
                  donation.isAnonymous
                    ? "bg-zinc-100 text-zinc-650 dark:bg-zinc-850 dark:text-zinc-350"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                }`}
              >
                {donation.isAnonymous ? (
                  <>
                    <Lock className="h-3 w-3" /> Anonymous
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3" /> Public
                  </>
                )}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500">
                  Name
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                  <User className="h-4 w-4 text-zinc-400" />
                  {donation.donorName || "Anonymous Donor"}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500">
                  Email Address
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-755 dark:text-zinc-300">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  {donation.donorEmail || "N/A"}
                </div>
              </div>
              {donation.user && (
                <div className="md:col-span-2 border-t border-zinc-100 dark:border-zinc-805 pt-6 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500">
                    Linked User Account
                  </span>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 font-extrabold text-sm">
                      {donation.user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white">
                        {donation.user.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-450">
                        {donation.user.email} (ID: {donation.user.id})
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Campaign Overview Card) */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
              Campaign Association
            </h2>
            {donation.campaign ? (
              <div className="space-y-6">
                {donation.campaign.image && (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-105 dark:bg-zinc-950 shadow-sm border border-zinc-100 dark:border-zinc-850">
                    <Image
                      src={donation.campaign.image}
                      alt={donation.campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                    {donation.campaign.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xxs font-bold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                      {donation.campaign.status}
                    </span>
                    <span className="text-xxs font-semibold text-zinc-400">
                      Created {new Date(donation.campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">
                      Campaign Progress
                    </span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xxs font-semibold text-zinc-450 dark:text-zinc-500">
                    <span>₦{donation.campaign.raisedAmount.toLocaleString()} Raised</span>
                    <span>Target: ₦{donation.campaign.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <Link
                    href={`/admin/campaigns`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10"
                  >
                    <Heart className="h-4 w-4" /> Manage Campaigns
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-dashed border-zinc-200 dark:border-zinc-850 text-center py-8">
                  <Heart className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                    General Fund Donation
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-450">
                    This donation was not earmarked for any specific campaign.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
