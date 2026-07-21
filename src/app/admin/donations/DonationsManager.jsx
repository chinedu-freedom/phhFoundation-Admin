"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import Pagination from "@/components/Pagination";
import Link from "next/link";

export default function DonationsManager({ initialDonations = [], campaigns = [] }) {
  const [donations, setDonations] = useState(initialDonations);
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const campaignOptions = [
    { value: "ALL", label: "All Campaigns" },
    { value: "GENERAL", label: "General Fund" },
    ...campaigns.map((c) => ({ value: c.id, label: c.title })),
  ];

  // Filter logic
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      (d.donorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.donorEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      d.reference.toLowerCase().includes(search.toLowerCase());

    const matchesCampaign =
      selectedCampaign === "ALL" ||
      (selectedCampaign === "GENERAL" && !d.campaignId) ||
      d.campaignId === selectedCampaign ||
      d.campaign?.title === selectedCampaign;

    return matchesSearch && matchesCampaign;
  });

  const totalItems = filteredDonations.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const paginationMeta = {
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by donor, email, or reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        {/* Campaign Filter */}
        <CustomSelect
          value={selectedCampaign}
          onChange={(val) => {
            setSelectedCampaign(val);
            setCurrentPage(1);
          }}
          options={campaignOptions}
          placeholder="Filter Campaign..."
          className="w-full md:w-56 "
        />
      </div>

      {/* Donations Table */}
      <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Donor Details</th>
                <th className="px-6 py-4">Campaign</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedDonations.map((d) => (
                <tr key={d.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-900 dark:text-white">
                    {d.reference}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-zinc-900 dark:text-white">
                      {d.donorName || "Anonymous"}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {d.donorEmail || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[180px] truncate">
                    {d.campaign?.title || "General Fund"}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-zinc-900 dark:text-white">
                    ₦{d.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xxs font-bold ${
                        d.isAnonymous
                          ? "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-350"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                      }`}
                    >
                      {d.isAnonymous ? "Anonymous" : "Public"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/donations/${d.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950 dark:hover:text-white transition-all shadow-sm"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredDonations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    No matching donations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination meta={paginationMeta} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
