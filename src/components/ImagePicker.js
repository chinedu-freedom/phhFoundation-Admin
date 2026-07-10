"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";

export default function ImagePicker({ value, onChange, label = "Featured Image" }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG, GIF, and WebP images are allowed.");
      return;
    }

    // Validate size (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError("File size is too large. Maximum size is 5MB.");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
        {label}
      </label>

      <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950">
        {value ? (
          <div className="w-full">
            <div className="relative mx-auto max-h-56 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900">
              <img
                src={value}
                alt="Upload preview"
                className="mx-auto max-h-56 object-contain"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-zinc-950 cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-950 cursor-pointer transition-colors"
              >
                Change Image
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="mb-3 rounded-full bg-zinc-100 p-3 text-zinc-400 dark:bg-zinc-900">
              <Upload className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Click to upload or drag & drop
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              PNG, JPG, WEBP or GIF (Max 5MB)
            </p>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Choose File
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg, image/png, image/webp, image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
