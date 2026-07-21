"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, UserCheck, Globe, ExternalLink, Search, Mail, Phone } from "lucide-react";
import ImagePicker from "@/components/ImagePicker";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import Pagination from "@/components/Pagination";
import { upsertTeamMemberAction, deleteTeamMemberAction } from "@/app/actions/team";
import { toast } from "sonner";

const Facebook = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function TeamClient({ initialMembers }) {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [image, setImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = members
    .filter(
      (m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedMembers = filtered.slice(
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

  const openAddModal = () => {
    setEditingMember({ order: members.length + 1 });
    setImage("");
    setIsModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMember(m);
    setImage(m.image || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("image", image);
    if (editingMember?.id) {
      formData.set("id", editingMember.id);
    }

    setIsSaving(true);
    const res = await upsertTeamMemberAction(null, formData);
    setIsSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingMember?.id ? "Team member updated!" : "Team member added!");
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteTeamMemberAction(deletingId);
    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Team member deleted");
      setMembers((prev) => prev.filter((m) => m.id !== deletingId));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search team member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-md bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Team Member
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedMembers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
              <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No team members added yet.
            </div>
          ) : (
            paginatedMembers.map((member) => (
              <div
                key={member.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative h-48 w-full rounded-xl bg-muted overflow-hidden border border-border">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-extrabold text-2xl">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5 text-xs px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold shadow-md border border-white/20">
                      Order {member.order}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug">{member.name}</h3>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                      {member.role}
                    </p>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Contact and Social Media Handles */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground border-t border-border/60">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-muted"
                        title={member.email}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    {(member.whatsapp || member.phone) && (
                      <a
                        href={`https://wa.me/${(member.whatsapp || member.phone).replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-emerald-600 transition-colors p-1 rounded hover:bg-muted"
                        title={member.whatsapp || member.phone}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {member.facebook && (
                      <a
                        href={member.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-muted"
                        title="Facebook Profile"
                      >
                        <Facebook className="h-4 w-4" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors p-1 rounded hover:bg-muted"
                        title="LinkedIn Profile"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(member.id)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <Pagination meta={paginationMeta} onPageChange={setCurrentPage} />
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
            className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto cursor-default"
          >
            <h3 className="text-lg font-bold text-foreground">
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingMember?.name || ""}
                  placeholder="e.g. Dr. Hephzibah"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Official Role / Title *
                </label>
                <input
                  type="text"
                  name="role"
                  required
                  defaultValue={editingMember?.role || ""}
                  placeholder="e.g. Founder & Executive Director"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingMember?.email || ""}
                  placeholder="e.g. member@hhfoundation.org"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="text"
                  name="whatsapp"
                  defaultValue={editingMember?.whatsapp || editingMember?.phone || ""}
                  placeholder="e.g. +2349066008854"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Facebook Profile URL
                </label>
                <input
                  type="url"
                  name="facebook"
                  defaultValue={editingMember?.facebook || ""}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  name="linkedin"
                  defaultValue={editingMember?.linkedin || ""}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Profile Photo (Optional)
                </label>
                <ImagePicker value={image} onChange={(url) => setImage(url)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Biography / Overview
                </label>
                <textarea
                  name="bio"
                  rows={3}
                  defaultValue={editingMember?.bio || ""}
                  placeholder="Short bio about leadership role..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Display Order Index (Must be Unique) *
                </label>
                <input
                  type="number"
                  name="order"
                  required
                  min={1}
                  defaultValue={editingMember?.order ?? (members.length + 1)}
                  placeholder="1"
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
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Team Member"
        description="Are you sure you want to delete this team profile?"
        isLoading={isDeleting}
      />
    </div>
  );
}
