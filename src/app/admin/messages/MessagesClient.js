"use client";

import { useState } from "react";
import { Search, Trash2, Mail, Eye, Calendar, User, Building } from "lucide-react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { deleteAuditLogAction } from "@/app/actions/contact";
import { toast } from "sonner";

export default function MessagesClient({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredMessages = messages.filter((m) => {
    const term = searchTerm.toLowerCase();
    const email = m.userEmail?.toLowerCase() || "";
    const details = m.details?.toLowerCase() || "";
    return email.includes(term) || details.includes(term);
  });

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteAuditLogAction(deletingId);
    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Message deleted successfully");
      setMessages((prev) => prev.filter((item) => item.id !== deletingId));
      if (selectedMessage?.id === deletingId) setSelectedMessage(null);
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by email, name or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>
        <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Total Inquiries: <span className="font-bold text-zinc-900 dark:text-white">{messages.length}</span>
        </div>
      </div>

      {/* Messages Table */}
      <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Sender Email</th>
                <th className="px-6 py-4">Details Summary</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No contact messages found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      <a href={`mailto:${msg.userEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {msg.userEmail || "Anonymous"}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-md truncate">
                      {msg.details}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          onClick={() => setDeletingId(msg.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Delete message"
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

      {/* Message Modal Drawer */}
      {selectedMessage && (
        <div
          onClick={() => setSelectedMessage(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Contact Inquiry Details
              </h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> Received
                </span>
                <span className="font-semibold text-foreground">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Email Address
                </span>
                <a
                  href={`mailto:${selectedMessage.userEmail}`}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedMessage.userEmail}
                </a>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border text-foreground space-y-2">
                <div className="font-semibold text-xs text-muted-foreground uppercase">Details</div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedMessage.details}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <a
                href={`mailto:${selectedMessage.userEmail}`}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="h-4 w-4" /> Reply via Email
              </a>
              <button
                onClick={() => setSelectedMessage(null)}
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
        title="Delete Message"
        description="Are you sure you want to delete this message log? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}
