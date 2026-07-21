"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { addGalleryImageAction, deleteGalleryImageAction } from "@/app/actions/gallery";
import { Plus, Trash, Loader2, Image as ImageIcon, X, Filter, FolderClosed, ShieldAlert } from "lucide-react";
import Image from "next/image";
import CustomSelect from "@/components/CustomSelect";
import ImagePicker from "@/components/ImagePicker";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import Pagination from "@/components/Pagination";

export default function GalleryManager({ initialImages = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [images, setImages] = useState(initialImages);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Sync props to state
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [album, setAlbum] = useState("Outreaches");

  const albumsList = ["Outreaches", "Healthcare", "Education", "Empowerment", "General"];

  const handleAddImage = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!url) {
      setError("Please select an image file first.");
      showToast("Please select an image file first.", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("url", url);
    formData.append("caption", caption);
    formData.append("album", album);

    try {
      const res = await addGalleryImageAction(null, formData);
      if (res.error) {
        setError(res.error);
        showToast(res.error, "error");
      } else {
        showToast("Image added to gallery successfully.", "success");
        setShowModal(false);
        setUrl("");
        setCaption("");
        setAlbum("Outreaches");
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
    if (!imageToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await deleteGalleryImageAction(imageToDelete);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        setImages(images.filter((img) => img.id !== imageToDelete));
        showToast("Image deleted successfully.", "success");
        router.refresh();
      }
    } catch (err) {
      showToast("Failed to delete image.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setImageToDelete(null);
    }
  };

  // Calculate statistics counts
  const totalCount = images.length;
  const albumCounts = images.reduce((acc, img) => {
    const key = img.album || "General";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredImages = images.filter((img) => {
    return activeTab === "All" || img.album === activeTab;
  });

  const totalItems = filteredImages.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedImages = filteredImages.slice(
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
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0A2540] dark:text-white font-poppins">
            Gallery Management
          </h1>
          <p className="mt-2 text-sm text-[#8F9BB3] dark:text-zinc-400">
            Upload outreach images, tag them to albums, and add descriptive captions.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Photo
        </button>
      </div>

      {/* Album Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mr-2">
          <Filter className="h-3.5 w-3.5" /> Filter Album:
        </span>
        <button
          onClick={() => {
            setActiveTab("All");
            setCurrentPage(1);
          }}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "All"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({totalCount})
        </button>
        {albumsList.map((alb) => {
          const count = albumCounts[alb] || 0;
          return (
            <button
              key={alb}
              onClick={() => {
                setActiveTab(alb);
                setCurrentPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === alb
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {alb} ({count})
            </button>
          );
        })}
      </div>



      {/* Grid List */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedImages.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted dark:bg-zinc-950 shadow-sm"
            >
              <Image
                src={img.url}
                alt={img.caption || "Gallery item"}
                fill
                className="object-cover group-hover:scale-102 transition-transform duration-300"
              />
              {/* Hover overlay details */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setImageToDelete(img.id);
                      setDeleteModalOpen(true);
                    }}
                    className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 transition-colors shadow cursor-pointer"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <span className="inline-block rounded bg-blue-650 px-2 py-0.5 text-xxs font-bold text-white uppercase tracking-wider mb-1">
                    {img.album}
                  </span>
                  <p className="text-xs text-white line-clamp-2 leading-relaxed">
                    {img.caption || "No caption provided"}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredImages.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-400 dark:text-zinc-550 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold">No pictures found in this album.</p>
              <p className="text-xs text-muted-foreground">Click 'Add Photo' to upload pictures for {activeTab === "All" ? "any album" : activeTab}.</p>
            </div>
          )}
        </div>
        <Pagination meta={paginationMeta} onPageChange={setCurrentPage} />
      </div>

      {/* Add Photo Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-8 border border-zinc-150 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Add Gallery Photo
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddImage} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <ImagePicker
                value={url}
                onChange={setUrl}
                label="Photo Image"
              />

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe this outreach moment"
                  className="mt-1.5 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-750 dark:text-zinc-300 mb-1.5">
                  Album / Category
                </label>
                <CustomSelect
                  value={album}
                  onChange={setAlbum}
                  options={albumsList.map((alb) => ({ value: alb, label: alb }))}
                  className="w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Gallery"}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setImageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Gallery Image"
        message="Are you sure you want to delete this gallery image? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
