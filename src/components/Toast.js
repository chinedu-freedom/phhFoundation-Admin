"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Dynamic Keyframes for smooth animations */}
      <style jsx global>{`
        @keyframes toastSlideIn {
          0% {
            transform: translate3d(1.5rem, 0, 0) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 1;
          }
        }
        .animate-toast-in {
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Floating Container (Top Right) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400";
          let Icon = CheckCircle;
          let iconColor = "text-emerald-600 dark:text-emerald-400";

          if (toast.type === "error") {
            bgClass = "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400";
            Icon = XCircle;
            iconColor = "text-rose-600 dark:text-rose-400";
          } else if (toast.type === "warning") {
            bgClass = "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400";
            Icon = AlertTriangle;
            iconColor = "text-amber-600 dark:text-amber-400";
          } else if (toast.type === "info") {
            bgClass = "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400";
            Icon = Info;
            iconColor = "text-blue-600 dark:text-blue-400";
          }

          return (
            <div
              key={toast.id}
              className={`animate-toast-in flex items-center justify-between gap-3.5 px-4.5 py-3.5 rounded-lg border shadow-lg shadow-black/[0.04] backdrop-blur-md pointer-events-auto transition-all ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5.5 h-5.5 shrink-0 ${iconColor}`} />
                <span className="text-sm font-semibold tracking-tight leading-relaxed">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-current/60 hover:text-current transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
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
