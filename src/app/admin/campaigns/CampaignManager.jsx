"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { upsertCampaignAction, deleteCampaignAction } from "@/app/actions/campaign";
import { Plus, Pencil, Trash, X, Calendar, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import CustomSelect from "@/components/CustomSelect";
import ImagePicker from "@/components/ImagePicker";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

export default function CampaignManager({ initialCampaigns = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showModal, setShowModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null); // Null for create, Campaign object for edit

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync props to state
  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const openCreateModal = () => {
    setEditCampaign(null);
    setTitle("");
    setDescription("");
    setImage("");
    setTargetAmount("");
    setStatus("DRAFT");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (campaign) => {
    setEditCampaign(campaign);
    setTitle(campaign.title);
    setDescription(campaign.description);
    setImage(campaign.image);
    setTargetAmount(campaign.targetAmount);
    setStatus(campaign.status);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    if (editCampaign) {
      formData.append("id", editCampaign.id);
    }
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("targetAmount", targetAmount.toString());
    formData.append("status", status);

    try {
      const res = await upsertCampaignAction(null, formData);
      if (res.error) {
        setError(res.error);
        showToast(res.error, "error");
      } else {
        showToast(editCampaign ? "Campaign updated successfully." : "Campaign created successfully.", "success");
        setShowModal(false);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      showToast("An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await deleteCampaignAction(campaignToDelete);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        setCampaigns(campaigns.filter((c) => c.id !== campaignToDelete));
        showToast("Campaign deleted successfully.", "success");
        router.refresh();
      }
    } catch (err) {
      showToast("Failed to delete campaign.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setCampaignToDelete(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Campaigns
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Create, edit, and publish humanitarian or educational sponsorship fundraisers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg cursor-pointer bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors shrink-0 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => {
          const raised = c.raisedAmount || 0;
          const percent = Math.min(Math.round((raised / c.targetAmount) * 100), 100);

          return (
            <div
              key={c.id}
              className="flex flex-col rounded-3xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Cover Image */}
              <div className="relative aspect-16/10">
                <Image src={c.image} alt={c.title} fill className="object-cover" />
                <div className="absolute top-4 left-4 rounded-full bg-zinc-950/70 backdrop-blur px-2.5 py-0.5 text-xxs font-bold text-white">
                  {c.status}
                </div>
              </div>

              {/* Info content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                    {c.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {/* Progress info */}
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 dark:bg-zinc-800">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-xxs font-semibold">
                    <div>
                      <span className="text-zinc-400">Raised:</span>{" "}
                      <strong className="text-zinc-900 dark:text-white">₦{raised.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400">Target:</span>{" "}
                      <strong className="text-zinc-900 dark:text-white">₦{c.targetAmount.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCampaignToDelete(c.id);
                        setDeleteModalOpen(true);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {campaigns.length === 0 && (
          <p className="col-span-full py-16 text-center text-sm text-zinc-400">
            No campaigns configured. Click "Create Campaign" to get started.
          </p>
        )}
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 border border-zinc-100 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editCampaign ? "Edit Campaign" : "New Campaign"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 hover:bg-zinc-50 dark:hover:bg-zinc-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Widows Career Support Outreach"
                  className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  required
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the scope, target beneficiaries, timeline, and impact..."
                  className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Target Goal (NGN)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="500000"
                    className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Status
                  </label>
                  <CustomSelect
                    value={status}
                    onChange={setStatus}
                    options={[
                      { value: "DRAFT", label: "DRAFT" },
                      { value: "ACTIVE", label: "ACTIVE" },
                      { value: "COMPLETED", label: "COMPLETED" }
                    ]}
                    className="mt-2 w-full"
                  />
                </div>
              </div>

              <ImagePicker
                value={image}
                onChange={setImage}
                label="Campaign Image"
              />

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Campaign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCampaignToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
