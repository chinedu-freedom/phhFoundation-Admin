"use client";

import { useState } from "react";
import { Search, ShieldAlert, Trash2, Calendar, Eye, Filter } from "lucide-react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import CustomSelect from "@/components/CustomSelect";
import { deleteAuditLogAction } from "@/app/actions/contact";
import { toast } from "sonner";

export default function AuditLogsClient({ initialLogs }) {
  const [logs, setLogs] = useState(initialLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const actionsList = Array.from(new Set(logs.map((l) => l.action)));

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteAuditLogAction(deletingId);
    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Audit log entry deleted");
      setLogs((prev) => prev.filter((item) => item.id !== deletingId));
    }
    setDeletingId(null);
  };

  const getActionBadgeColor = (action) => {
    if (action.includes("SUBMIT")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    if (action.includes("RSVP")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (action.includes("DELETE")) return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
            />
          </div>

          <CustomSelect
            value={actionFilter}
            onChange={setActionFilter}
            options={[
              { value: "ALL", label: "All Actions" },
              ...actionsList.map((act) => ({ value: act, label: act })),
            ]}
            placeholder="Filter Action..."
            className="w-full sm:w-56"
          />
        </div>

        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Total Logs: <span className="font-bold text-zinc-900 dark:text-white">{logs.length}</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">User Email</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                    <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No audit log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xxs font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-xs text-foreground">
                      {log.userEmail || "System / Guest"}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          onClick={() => setDeletingId(log.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete log entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div
          onClick={() => setSelectedLog(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground">Log Entry Detail</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground font-semibold">Action Name:</span>
                <span className="font-bold text-foreground">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground font-semibold">Timestamp:</span>
                <span className="font-medium text-foreground">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-muted/40 border border-border">
                <span className="text-muted-foreground font-semibold">User Email:</span>
                <span className="font-medium text-foreground">{selectedLog.userEmail || "N/A"}</span>
              </div>
              {selectedLog.ipAddress && (
                <div className="flex justify-between p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-muted-foreground font-semibold">IP Address:</span>
                  <span className="font-mono text-foreground">{selectedLog.ipAddress}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                <div className="text-xs uppercase font-bold text-muted-foreground">Full Details</div>
                <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {selectedLog.details}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Audit Log"
        description="Are you sure you want to remove this log entry?"
        isLoading={isDeleting}
      />
    </div>
  );
}
