"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { upsertBlogAction, deleteBlogAction } from "@/app/actions/blog";
import { Plus, Pencil, Trash, X, Loader2, User, Clock, Image as ImageIcon, BookOpen, Search } from "lucide-react";
import Image from "next/image";
import CustomSelect from "@/components/CustomSelect";
import ImagePicker from "@/components/ImagePicker";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import Pagination from "@/components/Pagination";

export default function BlogManager({ initialPosts = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [posts, setPosts] = useState(initialPosts);
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null); // Null for create, BlogPost object for edit
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync props to state
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalItems = filteredPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPosts = filteredPosts.slice(
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
  };// Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Community Outreach");
  const [authorName, setAuthorName] = useState("HH Foundation");
  const [authorEmail, setAuthorEmail] = useState("hephzibahhumanitarianf@gmail.com");
  const [status, setStatus] = useState("DRAFT");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const openCreateModal = () => {
    setEditPost(null);
    setTitle("");
    setContent("");
    setImage("");
    setCategory("Community Outreach");
    setAuthorName("HH Foundation");
    setAuthorEmail("hephzibahhumanitarianf@gmail.com");
    setStatus("DRAFT");
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (post) => {
    setEditPost(post);
    setTitle(post.title);
    setContent(post.content);
    setImage(post.image || "");
    setCategory(post.category);
    setAuthorName(post.authorName);
    setAuthorEmail(post.authorEmail);
    setStatus(post.status);
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    if (editPost) {
      formData.append("id", editPost.id);
    }
    formData.append("title", title);
    formData.append("content", content);
    formData.append("image", image);
    formData.append("category", category);
    formData.append("authorName", authorName);
    formData.append("authorEmail", authorEmail);
    formData.append("status", status);

    try {
      const res = await upsertBlogAction(null, formData);
      if (res.error) {
        setError(res.error);
        showToast(res.error, "error");
      } else {
        showToast(editPost ? "Article updated successfully." : "Article created successfully.", "success");
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
    if (!postToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await deleteBlogAction(postToDelete);
      if (res.error) {
        showToast(res.error, "error");
      } else {
        setPosts(posts.filter((p) => p.id !== postToDelete));
        showToast("Article deleted successfully.", "success");
        router.refresh();
      }
    } catch (err) {
      showToast("Failed to delete blog post.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };



  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">
            Blog Articles
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Publish foundation updates, success stories, and press releases.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Article
        </button>
      </div>

      {/* Search and Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles by title, content, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border border-zinc-200 bg-white h-11 pl-10 pr-4 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-colors"
          />
        </div>

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "ALL", label: "All Statuses" },
            { value: "DRAFT", label: "Draft" },
            { value: "PUBLISHED", label: "Published" }
          ]}
        />
      </div>

      {/* Articles Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-950">
                <Image
                  src={post.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 rounded-full bg-zinc-950/70 backdrop-blur px-2.5 py-0.5 text-xxs font-bold text-white">
                  {post.status}
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xxs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {post.category}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-zinc-900 dark:text-white line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">
                    {post.content}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xxs text-zinc-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> {post.authorName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => openEditModal(post)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-950 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setPostToDelete(post.id);
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
          ))}

          {filteredPosts.length === 0 && (
            <p className="col-span-full py-16 text-center text-sm text-zinc-400">
              No articles found. Click "Create Article" to share a story.
            </p>
          )}
        </div>
        <Pagination meta={paginationMeta} onPageChange={setCurrentPage} />
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-md bg-white p-6 border border-zinc-100 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editPost ? "Edit Article" : "Create New Article"}
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
                <div className="rounded-md bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Successfully Completed Port Harcourt Medical Outreach"
                  className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Category
                </label>
                <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={[
                    { value: "Community Outreach", label: "Community Outreach" },
                    { value: "Medical Outreach", label: "Medical Outreach" },
                    { value: "Education", label: "Education" },
                    { value: "Success Stories", label: "Success Stories" },
                    { value: "Press Release", label: "Press Release" },
                    { value: "Disaster Relief", label: "Disaster Relief" }
                  ]}
                  className="mt-2 w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Author Name
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Author Email
                </label>
                <input
                  type="email"
                  required
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Content (Markdown Supported)
                </label>
                <textarea
                  required
                  rows="6"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell the story of impact, the timeline, key quotes..."
                  className="mt-2 block w-full rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <ImagePicker
                value={image}
                onChange={setImage}
                label="Featured Image"
              />

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Status
                </label>
                <CustomSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "DRAFT", label: "DRAFT" },
                    { value: "PUBLISHED", label: "PUBLISHED" }
                  ]}
                  className="mt-2 w-full"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-450 dark:hover:bg-zinc-950 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Article"}
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
          setPostToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
}
