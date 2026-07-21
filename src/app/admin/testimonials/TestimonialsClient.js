"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Quote, ToggleLeft, ToggleRight, Search, User } from "lucide-react";
import ImagePicker from "@/components/ImagePicker";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import {
  upsertTestimonialAction,
  toggleTestimonialStatusAction,
  deleteTestimonialAction,
} from "@/app/actions/testimonial";
import { toast } from "sonner";

export default function TestimonialsClient({ initialTestimonials }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [image, setImage] = useState("");
  const [status, setStatus] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.quote.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingTestimonial(null);
    setImage("");
    setStatus(true);
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTestimonial(t);
    setImage(t.image || "");
    setStatus(t.status ?? true);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("image", image);
    formData.set("status", status ? "true" : "false");
    if (editingTestimonial?.id) {
      formData.set("id", editingTestimonial.id);
    }

    setIsSaving(true);
    const res = await upsertTestimonialAction(null, formData);
    setIsSaving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingTestimonial ? "Testimonial updated!" : "Testimonial added!");
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const handleToggleStatus = async (t) => {
    const res = await toggleTestimonialStatusAction(t.id, t.status);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Testimonial ${t.status ? "disabled" : "enabled"}`);
      setTestimonials((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, status: !item.status } : item))
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteTestimonialAction(deletingId);
    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Testimonial deleted");
      setTestimonials((prev) => prev.filter((t) => t.id !== deletingId));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, role or quote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            <Quote className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No testimonials found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-2xl border ${
                item.status ? "border-border" : "border-amber-500/30 bg-amber-500/5"
              } p-6 shadow-sm flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(item)}
                    title={item.status ? "Active (click to disable)" : "Disabled (click to activate)"}
                    className="cursor-pointer"
                  >
                    {item.status ? (
                      <ToggleRight className="h-6 w-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic border-l-2 border-blue-500 pl-3">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                <span className={item.status ? "text-green-500 font-semibold" : "text-amber-500 font-semibold"}>
                  {item.status ? "Published" : "Hidden"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <h3 className="text-lg font-bold text-foreground">
              {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Person Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingTestimonial?.name || ""}
                    placeholder="e.g. Grace Chukwu"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Role / Subtitle *
                  </label>
                  <input
                    type="text"
                    name="role"
                    required
                    defaultValue={editingTestimonial?.role || ""}
                    placeholder="e.g. Scholarship Recipient"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Photo (Optional)
                </label>
                <ImagePicker value={image} onChange={(url) => setImage(url)} />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Quote / Testimonial Message *
                </label>
                <textarea
                  name="quote"
                  rows={4}
                  required
                  defaultValue={editingTestimonial?.quote || ""}
                  placeholder="Enter quote text..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="statusCheckbox"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <label htmlFor="statusCheckbox" className="text-xs font-semibold text-foreground cursor-pointer">
                  Show on website (Active)
                </label>
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
                {isSaving ? "Saving..." : "Save Testimonial"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        description="Are you sure you want to delete this testimonial quote?"
        isLoading={isDeleting}
      />
    </div>
  );
}
