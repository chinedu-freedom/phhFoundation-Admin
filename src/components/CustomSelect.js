"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({ value, onChange, options, placeholder = "Select...", className = "w-full md:w-48" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white cursor-pointer transition-colors"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 min-w-[8rem] w-full rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in slide-in-from-top-1 duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-2 px-3 text-sm outline-none transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                  isSelected
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-medium"
                    : "text-zinc-750 dark:text-zinc-300"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
