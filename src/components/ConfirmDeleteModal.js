import React from "react";
import { X } from "lucide-react";

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 border border-zinc-100 shadow-2xl dark:bg-zinc-900 dark:border-zinc-800 animate-in zoom-in-95 duration-200 relative"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-605 dark:hover:text-white rounded-lg p-1 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col space-y-1.5 text-left">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h3>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-450 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-750 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
