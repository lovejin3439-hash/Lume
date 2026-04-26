"use client";

import { motion } from "framer-motion";

export function Logo() {
  return (
    <div className="flex items-center gap-4">
      <motion.div
        animate={{ y: [0, -1.5, 0], opacity: [0.94, 1, 0.94] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid h-12 w-12 place-items-center"
        aria-hidden="true"
      >
        <svg className="h-11 w-11 text-lume-ink" viewBox="0 0 64 64" fill="none">
          <path
            d="M18 8v31.5C18 50.8 25.4 56 36.3 56H45"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="7.5"
          />
          <path
            d="M34 45.5 51.5 28"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="7.5"
          />
          <path d="M38 45.5h14.5" stroke="currentColor" strokeLinecap="round" strokeWidth="7.5" />
          <motion.path
            animate={{ scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            d="M45.5 7.5c1.4 7.2 3.9 9.7 11.1 11.1-7.2 1.4-9.7 3.9-11.1 11.1-1.4-7.2-3.9-9.7-11.1-11.1 7.2-1.4 9.7-3.9 11.1-11.1Z"
            fill="currentColor"
            style={{ transformOrigin: "45.5px 18.6px" }}
          />
        </svg>
      </motion.div>
      <div className="min-w-0">
        <div className="text-lg font-semibold uppercase tracking-[0.46em] text-lume-ink">Lume</div>
        <div className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.28em] text-lume-muted xl:block">
          Plan your day, brighter.
        </div>
      </div>
    </div>
  );
}
