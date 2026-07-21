"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ meta, onPageChange }) {
  if (!meta || Object.keys(meta).length === 0) return null;

  // Extract pagination data
  const currentPage = meta.currentPage || 1;
  const totalPages = meta.totalPages || 1;
  const totalItems = meta.totalItems || 0;
  const pageSize = meta.pageSize || 10;
  const hasNextPage = meta.hasNextPage ?? (currentPage < totalPages);
  const hasPrevPage = meta.hasPrevPage ?? (currentPage > 1);

  // Calculate the range being shown with ALWAYS 2-digit format
  const calculateRange = () => {
    if (totalItems === 0) return "0 results";
    
    const start = ((currentPage - 1) * pageSize) + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    
    const formatNumber = (num) => {
      return num.toString().padStart(2, '0');
    };
    
    return `${formatNumber(start)}-${formatNumber(end)} of ${totalItems}`;
  };

  return (
    <div
      className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300 
                px-4 py-3 bg-white dark:bg-card border-t border-zinc-200 dark:border-zinc-800 
                rounded-b-xl"
    >
      {/* Results info - shows "01-10 of 78" */}
      <div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{calculateRange()}</span>
        </p>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 
                     disabled:opacity-40 disabled:cursor-not-allowed 
                     cursor-pointer transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 
                     disabled:opacity-40 disabled:cursor-not-allowed 
                     cursor-pointer transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
