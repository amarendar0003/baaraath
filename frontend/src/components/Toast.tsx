"use client";

import { useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let globalListeners: ((toast: Toast) => void)[] = [];

function emit(toast: Toast) {
  globalListeners.forEach((fn) => fn(toast));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== toast.id));
      }, 3500);
    };
    globalListeners = [...globalListeners, handler];
    return () => {
      globalListeners = globalListeners.filter((fn) => fn !== handler);
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const toast: Toast = {
      id: Math.random().toString(36).slice(2, 9),
      message,
      type,
    };
    emit(toast);
  }, []);

  return { toasts, showToast };
}

const styles: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-[#e9dfd7] bg-white text-[#342433]",
};

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-max max-w-md flex-col gap-2 px-4 sm:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg transition-all duration-300 ${styles[toast.type]}`}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-extrabold">
            {icons[toast.type]}
          </span>
          <span className="font-semibold">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
