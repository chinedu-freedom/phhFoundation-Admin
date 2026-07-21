"use client";

import { useState } from "react";
import { Search, Download, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import { deleteSubscriberAction } from "@/app/actions/subscriber";
import { toast } from "sonner";

export default function SubscribersManager({ initialSubscribers = [] }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Filter subscribers by search query
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  // Export as CSV
  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      toast.error("No subscribers to export.");
      return;
    }

    const headers = ["ID", "Email", "Status", "Date Subscribed"];
    const rows = filteredSubscribers.map((s) => [
      s.id,
      s.email,
      s.active ? "Active" : "Inactive",
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "N/A"
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hh_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Successfully exported ${filteredSubscribers.length} subscribers to CSV.`);
  };

  // Delete subscriber
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subscriber?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteSubscriberAction(id);
      if (res?.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        toast.success("Subscriber removed successfully.");
      } else {
        toast.error(res?.error || "Failed to remove subscriber.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar - Search and Download */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        <button
          onClick={handleExportCSV}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </button>
      </div>

      {/* Grid / Table list */}
      <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400 font-poppins">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Subscriber Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Subscribed</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredSubscribers.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-zinc-900 dark:text-white">
                      {s.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      disabled={deletingId === s.id}
                      onClick={() => handleDelete(s.id)}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all cursor-pointer"
                      title="Unsubscribe / Remove Email"
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
