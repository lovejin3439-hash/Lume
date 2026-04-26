"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useLumeStore, type LumeToast } from "@/store/useLumeStore";

const toneIcon = {
  success: CheckCircle2,
  info: Info,
  danger: XCircle,
};

const toneClass = {
  success: "text-lume-primary bg-[#F4F4F2]",
  info: "text-[#344B60] bg-[#F0F4F7]",
  danger: "text-[#E06153] bg-[#FFF0EE]",
};

export function ToastStack() {
  const toasts = useLumeStore((state) => state.toasts);
  const dismissToast = useLumeStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] grid w-[min(360px,calc(100vw-32px))] gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: LumeToast; onDismiss: () => void }) {
  const tone = toast.tone ?? "info";
  const Icon = toneIcon[tone];

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-lume-border bg-white/95 p-4 shadow-glow backdrop-blur-xl"
    >
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass[tone]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-lume-ink">{toast.title}</div>
        {toast.description ? (
          <div className="mt-0.5 truncate text-xs font-medium text-lume-muted">{toast.description}</div>
        ) : null}
      </div>
      <button
        className="grid h-7 w-7 place-items-center rounded-full text-lume-muted transition hover:bg-[#F4F4F2] hover:text-lume-ink"
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.article>
  );
}
