"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-error/30 bg-error/10",
  info: "border-primary-container/30 bg-primary-container/10",
};

const iconColorMap = {
  success: "text-emerald-400",
  error: "text-error",
  info: "text-primary-container",
};

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = iconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`fixed bottom-6 right-6 z-[10000] glass-panel px-5 py-3.5 rounded-xl border ${colorMap[type]} flex items-center gap-3 shadow-2xl max-w-sm`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${iconColorMap[type]}`} />
      <span className="text-body-sm text-white font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-outline hover:text-white transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Hook for toast management
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      setToast({ message, type });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastComponent = toast ? (
    <AnimatePresence>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </AnimatePresence>
  ) : null;

  return { showToast, hideToast, ToastComponent };
}
