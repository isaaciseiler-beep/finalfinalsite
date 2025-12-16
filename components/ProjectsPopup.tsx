"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";

type PopupEntry = {
  id: string;
  kindLabel: string;
  title: string;
  image?: string;
  date?: string;
  summary?: string;
  html: string;
};

function formatDateLocal(date?: string) {
  if (!date) return "undated";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ProjectsPopup({
  open,
  entry,
  topPx,
  onClose,
}: {
  open: boolean;
  entry: PopupEntry | null;
  topPx: number;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // lock page scroll while open
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    // focus close button for keyboard users
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const top = useMemo(() => {
    // keep it starting around the filter-row region, but never too high/low
    return clamp(Math.round(topPx || 112), 88, 220);
  }, [topPx]);

  const overlayTransition = reduce
    ? { duration: 0 }
    : { duration: 0.18, ease: "easeOut" as const };

  const panelTransition = reduce
    ? { duration: 0 }
    : ({
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1], // smooth, “consumer app” ease-out
      } as any);

  return (
    <AnimatePresence>
      {open && entry && (
        <motion.div
          className="fixed inset-y-0 right-0 z-[55]"
          // cover only the content pane, never the sidebar
          style={{ left: "var(--sidebar-offset, 0px)" } as any}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          {/* backdrop: dim + blur (content pane only) */}
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          />

          {/* click-outside zone */}
          <div
            className="absolute inset-0 px-4 sm:px-6"
            onPointerDown={() => onClose()}
          >
            {/* popup window (stop outside click) */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={entry.title}
              className={[
                "absolute left-0 right-0 mx-auto w-full max-w-[1040px]",
                "overflow-hidden rounded-3xl border border-white/10",
                // fully opaque pane (no see-through)
                "bg-black",
                "shadow-[0_0_60px_rgba(0,0,0,0.72)]",
              ].join(" ")}
              style={{ top, bottom: 28 }}
              initial={
                reduce
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 14, scale: 0.985 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduce
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 14, scale: 0.985 }
              }
              transition={panelTransition}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* close button */}
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="close"
                onClick={onClose}
                className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/80 text-sm text-white backdrop-blur transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                ✕
              </button>

              {/* internal scroll only */}
              <div className="h-full overflow-y-auto [overscroll-behavior:contain]">
                {/* image header */}
                <div className="relative aspect-[16/10] w-full bg-neutral-900">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 1040px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>

                {/* meta */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                      {entry.kindLabel}
                    </span>
                    <span className="text-xs text-white/60">
                      <time dateTime={entry.date}>
                        {formatDateLocal(entry.date)}
                      </time>
                    </span>
                  </div>

                  <h1 className="mt-3 text-2xl sm:text-3xl font-normal tracking-tight text-white">
                    {entry.title}
                  </h1>

                  {entry.summary && (
                    <p className="mt-3 text-sm sm:text-base text-white/65">
                      {entry.summary}
                    </p>
                  )}
                </div>

                {/* content */}
                <div className="px-5 pb-10 sm:px-6">
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
