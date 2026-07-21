"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, ExternalLink, Building2, FileText, Mail, Search } from "lucide-react";
import ImagePicker from "@/components/ImagePicker";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { upsertPartnerAction, deletePartnerAction } from "@/app/actions/partner";
import { deleteAuditLogAction } from "@/app/actions/contact";
import { toast } from "sonner";

export default function PartnersClient({ initialPartners, initialInquiries }) {
  const [activeTab, setActiveTab] = useState("logos"); // "logos" | "inquiries"
  const [partners, setPartners] = useState(initialPartners);
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingPartnerId, setDeletingPartnerId] = useState(null);
  const [deletingInquiryId, setDeletingInquiryId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInquiries = inquiries.filter(
    (i) =>
      i.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingPartner(null);
    setLogoUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setLogoUrl(partner.logoUrl);
    setIsModalOpen(true);
  };

  const handleSavePartner = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("logoUrl", logoUrl);
    if (editingPartner?.id) {
      formData.set("id", editingPartner.id);
    }

    setIsSaving(true);
    const res = await upsertPartnerAction(null, formData);
    setIsSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingPartner ? "Partner updated!" : "Partner added!");
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const handleDeletePartner = async () => {
    if (!deletingPartnerId) return;
    setIsDeleting(true);
    const res = await deletePartnerAction(deletingPartnerId);
    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Partner removed");
      setPartners((prev) => prev.filter((p) => p.id !== deletingPartnerId));
    }
    setDeletingPartnerId(null);
  };

  const handleDeleteInquiry = async () => {
    if (!deletingInquiryId) return;
    setIsDeleting(true);
    const res = await deleteAuditLogAction(deletingInquiryId);
    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Inquiry log removed");
      setInquiries((prev) => prev.filter((i) => i.id !== deletingInquiryId));
    }
    setDeletingInquiryId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search & Add Button Row */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        {activeTab === "logos" && (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-md bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Partner Logo
          </button>
        )}
      </div>

      {/* Tabs Navigation Underneath */}
      <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl border border-border w-fit">
        <button
          onClick={() => setActiveTab("logos")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "logos"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" /> Partner Logos ({partners.length})
        </button>
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === "inquiries"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" /> Form Inquiries ({inquiries.length})
        </button>
      </div>

      {/* TAB 1: Partner Logos Grid */}
      {activeTab === "logos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPartners.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No partner logos added yet.
            </div>
          ) : (
            filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="h-28 rounded-xl bg-muted/40 p-4 border border-border flex items-center justify-center overflow-hidden">
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{partner.name}</h3>
                  {partner.websiteUrl && (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    onClick={() => openEditModal(partner)}
                    className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingPartnerId(partner.id)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Form Inquiries Table */}
      {activeTab === "inquiries" && (
        <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Contact Email</th>
                  <th className="px-6 py-4">Inquiry Details</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No corporate partnership inquiries found.
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        <a href={`mailto:${inq.userEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                          {inq.userEmail}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground max-w-lg">
                        {inq.details}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeletingInquiryId(inq.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Partner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePartner}
            className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <h3 className="text-lg font-bold text-foreground">
              {editingPartner ? "Edit Partner Logo" : "Add New Partner"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Partner / Organization Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingPartner?.name || ""}
                  placeholder="e.g. Acme Corp Foundation"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Partner Logo *
                </label>
                <ImagePicker
                  value={logoUrl}
                  onChange={(url) => setLogoUrl(url)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Website URL (Optional)
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  defaultValue={editingPartner?.websiteUrl || ""}
                  placeholder="https://example.org"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-foreground font-semibold text-xs hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !logoUrl}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Partner"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modals */}
      <ConfirmDeleteModal
        isOpen={!!deletingPartnerId}
        onClose={() => setDeletingPartnerId(null)}
        onConfirm={handleDeletePartner}
        title="Delete Partner Logo"
        description="Are you sure you want to remove this partner logo?"
        isLoading={isDeleting}
      />
      <ConfirmDeleteModal
        isOpen={!!deletingInquiryId}
        onClose={() => setDeletingInquiryId(null)}
        onConfirm={handleDeleteInquiry}
        title="Delete Inquiry Log"
        description="Are you sure you want to delete this partnership inquiry?"
        isLoading={isDeleting}
      />
    </div>
  );
}
