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

  const top = useMemo(() => clamp(Math.round(topPx || 112), 88, 220), [topPx]);

  const overlayTransition = reduce
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as any };

  const panelTransition = reduce
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.16, 1, 0.3, 1] as any };

  return (
    <AnimatePresence>
      {open && entry && (
        <motion.div
          className="fixed inset-0 z-[45]"
          // cover only the content pane (never the sidebar/logo)
          style={{ left: "var(--sidebar-offset, 0px)" } as any}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          {/* backdrop: dim + blur */}
          <motion.button
            type="button"
            aria-label="close popup"
            onClick={onClose}
            className={[
              "absolute inset-0 h-full w-full",
              // fallback: dim even if backdrop-filter is unsupported
              "bg-black/60",
              // when supported: slightly lighter dim + strong blur
              "supports-[backdrop-filter]:bg-black/40 supports-[backdrop-filter]:backdrop-blur-xl",
            ].join(" ")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          />

          {/* window */}
          <div className="absolute inset-0 px-4 sm:px-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={entry.title}
              className={[
                "absolute left-1/2 -translate-x-1/2",
                "w-full max-w-[980px]",
                "overflow-hidden rounded-3xl border border-white/10",
                // solid, non-translucent pane background
                "bg-neutral-950",
                "shadow-[0_0_60px_rgba(0,0,0,0.75)]",
              ].join(" ")}
              style={{ top, bottom: 28 }}
              initial={
                reduce
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 18, scale: 0.985 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                reduce
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 18, scale: 0.985 }
              }
              transition={panelTransition}
              onClick={(e) => e.stopPropagation()}
            >
              {/* close */}
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="close"
                onClick={onClose}
                className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/80 text-sm text-white backdrop-blur transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                ✕
              </button>

              {/* only this scrolls */}
              <div className="h-full overflow-y-auto [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch] touch-pan-y">
                {/* image header */}
                <div className="relative aspect-[16/10] w-full bg-neutral-900">
                  {entry.image ? (
                    <Image
                      src={entry.image}
                      alt={entry.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 980px"
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
                      <time dateTime={entry.date}>{formatDateLocal(entry.date)}</time>
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
