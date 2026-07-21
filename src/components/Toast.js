"use client";

import { createContext, useContext, useCallback } from "react";
import { toast, Toaster } from "sonner";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const opts = { duration };
    if (type === "error" || type === "destructive") {
      toast.error(message, opts);
    } else if (type === "warning") {
      toast.warning(message, opts);
    } else if (type === "info") {
      toast.info(message, opts);
    } else {
      toast.success(message, opts);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster position="top-right" richColors />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
