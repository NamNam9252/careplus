"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  isVisible: boolean;
}

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
    icon: "✓",
    border: "border-emerald-400",
  },
  error: {
    bg: "bg-gradient-to-r from-red-500 to-rose-500",
    icon: "✕",
    border: "border-red-400",
  },
  warning: {
    bg: "bg-gradient-to-r from-amber-500 to-orange-500",
    icon: "⚠",
    border: "border-amber-400",
  },
  info: {
    bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
    icon: "ℹ",
    border: "border-blue-400",
  },
};

export function Toast({ message, type = "info", duration = 5000, onClose, isVisible }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const style = toastStyles[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-2xl ${style.bg} text-white border ${style.border}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
            {style.icon}
          </span>
          <p className="text-sm font-semibold max-w-xs">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast hook for easy usage
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = React.useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const ToastComponent = () => (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  );

  return { showToast, hideToast, ToastComponent };
}
