"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

function readSidebarOffsetPx(): number {
  // SiteShell sets --sidebar-offset on its root motion div (not on :root).
  // This grabs the live computed value so the popup never covers sidebar/logo.
  const shell =
    document.querySelector<HTMLElement>('[style*="--sidebar-offset"]') ??
    document.querySelector<HTMLElement>('[style*="padding-left: var(--sidebar-offset"]');

  if (!shell) return 0;

  const raw = getComputedStyle(shell).getPropertyValue("--sidebar-offset").trim();
  const m = raw.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const top = useMemo(() => clamp(Math.round(topPx || 112), 96, 220), [topPx]);

  // mount guard for createPortal
  useEffect(() => setMounted(true), []);

  // keep overlay aligned with the animated sidebar offset (without re-rendering)
  useEffect(() => {
    if (!open) return;
    let raf = 0;

    const tick = () => {
      const el = rootRef.current;
      if (el) el.style.left = `${readSidebarOffsetPx()}px`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // lock background scroll WITHOUT shifting layout (scrollbar compensation)
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPadRight = body.style.paddingRight;

    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadRight;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const overlayTransition = reduce
    ? { duration: 0 }
    : ({ duration: 0.18, ease: [0.22, 1, 0.36, 1] } as any);

  const panelTransition = reduce
    ? { duration: 0 }
    : ({ duration: 0.28, ease: [0.16, 1, 0.3, 1] } as any);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && entry ? (
        <motion.div
          ref={rootRef}
          className="fixed inset-y-0 right-0 z-[55]"
          // left is set live in rAF from --sidebar-offset
          style={{ left: "0px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          {/* backdrop: dim + blur (content pane only) */}
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onMouseDown={onClose}
          />

          {/* window wrapper */}
          <div className="absolute inset-0 px-4 sm:px-6">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={entry.title}
              className="absolute inset-x-0 mx-auto w-full max-w-[940px]"
              style={{
                top,
                // keep the popup ending “around the footer” + never past the page frame
                bottom: "calc(var(--footer-h, 0px) + 22px)",
              }}
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
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* fully opaque window (no translucency) */}
              <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_0_70px_rgba(0,0,0,0.75)]">
                {/* close button */}
                <button
                  ref={closeBtnRef}
                  type="button"
                  aria-label="close"
                  onClick={onClose}
                  className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black text-sm text-white transition hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  ✕
                </button>

                {/* scroll region (only this scrolls) */}
                <div className="flex-1 min-h-0 overflow-y-auto [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch] touch-pan-y">
                  {/* header image */}
                  <div className="relative aspect-[16/10] w-full bg-neutral-900">
                    {entry.image ? (
                      <Image
                        src={entry.image}
                        alt={entry.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 940px"
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
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
