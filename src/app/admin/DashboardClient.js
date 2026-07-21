"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  HeartHandshake, 
  HandHeart,
  ArrowUpRight, 
  Clock,
  TrendingUp,
  Activity,
  UserPlus,
  BookOpen,
  CalendarDays,
  Image as ImageIcon,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import Link from "next/link";

export default function DashboardClient({ initialStats }) {
  const [stats, setStats] = useState(initialStats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Activity className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="font-semibold">Loading system metrics...</p>
      </div>
    );
  }

  // Formatting helper
  const formatNGN = (val) => `₦${Number(val).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* 1. Header Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">Real-time snapshot of the HH Foundation fundraising activity and operations.</p>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Funds Raised */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-blue-600 dark:text-blue-400 truncate max-w-[180px]">
              {formatNGN(stats.totalFundsRaised)}
            </h3>
            <p className="text-[13px] font-medium text-muted-foreground mt-1 tracking-wide">Total Funds Raised</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Donations */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.donationsCount}</h3>
            <p className="text-[13px] font-medium text-muted-foreground mt-1 tracking-wide">Total Donations</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HandHeart className="w-5 h-5" />
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats.activeCampaignsCount}</h3>
            <p className="text-[13px] font-medium text-muted-foreground mt-1 tracking-wide">Active Campaigns</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        {/* Total Volunteers */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{stats.volunteersCount}</h3>
            <p className="text-[13px] font-medium text-muted-foreground mt-1 tracking-wide">Total Volunteers</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Charts & Quick Actions Section */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Trend Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground text-base">Donations & Volunteers Activity</h3>
                <p className="text-xs text-muted-foreground">7-day tracking of donations volume and volunteer signups.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Donations (₦)
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded bg-purple-500" /> Volunteers
                </span>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" h="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorVolunteers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#a855f7" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                    labelClassName="font-bold text-xs mb-1"
                  />
                  <Area yAxisId="left" type="monotone" dataKey="Donations" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDonations)" />
                  <Area yAxisId="right" type="monotone" dataKey="Volunteers" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolunteers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-foreground text-base mb-1">Quick Actions</h3>
              <p className="text-xs text-muted-foreground mb-4">Common administrative tasks</p>
            </div>
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              <Link href="/admin/campaigns" className="block w-full">
                <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 cursor-pointer w-full">
                  <HeartHandshake className="w-5 h-5 mr-1" />
                  Manage Campaigns
                </button>
              </Link>
              <Link href="/admin/donations" className="block w-full">
                <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer w-full">
                  <HandHeart className="w-5 h-5 mr-1 text-muted-foreground" />
                  Donations Ledger
                </button>
              </Link>
              <Link href="/admin/volunteers" className="block w-full">
                <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer w-full">
                  <Users className="w-5 h-5 mr-1 text-muted-foreground" />
                  Volunteer Applications
                </button>
              </Link>
              <Link href="/admin/blog" className="block w-full">
                <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer w-full">
                  <BookOpen className="w-5 h-5 mr-1 text-muted-foreground" />
                  Blog Publisher
                </button>
              </Link>
              <Link href="/admin/events" className="block w-full">
                <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer w-full">
                  <CalendarDays className="w-5 h-5 mr-1 text-muted-foreground" />
                  Plan Events
                </button>
              </Link>
              <Link href="/admin/gallery" className="block w-full">
                <button className="inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer w-full">
                  <ImageIcon className="w-5 h-5 mr-1 text-muted-foreground" />
                  Media Gallery
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Logs & Users Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donations Table (2 Cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-foreground text-base">Recent Donations</h3>
            </div>
            <Link href="/admin/donations" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-0.5">
              Ledger <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Donor</th>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentDonations.slice(0, 5).map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">
                        {d.isAnonymous ? "Anonymous" : d.donorName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {d.isAnonymous ? "N/A" : d.donorEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[150px] truncate text-muted-foreground">
                      {d.campaign?.title || "General Fund"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      ₦{d.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{d.paymentMethod}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-medium">
                      {new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                  </tr>
                ))}
                {stats.recentDonations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No donations logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Volunteers List (1 Col) */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-foreground text-base">Recent Volunteers</h3>
            </div>
            <Link href="/admin/volunteers" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-0.5">
              All Applicants <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-hide">
            {stats.recentVolunteers.length > 0 ? (
              stats.recentVolunteers.slice(0, 5).map((v) => (
                <div key={v.id} className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border hover:border-border transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0">
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-foreground truncate">
                        {v.name}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.email}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {v.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs">No volunteer applications submitted yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
