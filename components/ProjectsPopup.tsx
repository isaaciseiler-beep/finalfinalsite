"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

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

// best-effort read of the sidebar offset so the overlay never covers sidebar/logo
function readSidebarOffsetPx(): number {
  // try :root first
  {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--sidebar-offset")
      .trim();
    const m = raw.match(/-?\d+(\.\d+)?/);
    if (m) return Number(m[0]);
  }

  // otherwise, find an element that has the variable defined
  const shell =
    document.querySelector<HTMLElement>('[style*="--sidebar-offset"]') ??
    document.querySelector<HTMLElement>('[class*="SiteShell"]') ??
    null;

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
  const rootRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // keep overlay aligned with the live sidebar width while open
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

  // lock background scroll without shifting layout
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

  const top = useMemo(() => clamp(Math.round(topPx || 112), 96, 220), [topPx]);

  const overlayTransition = reduce
    ? { duration: 0 }
    : ({ duration: 0.22, ease: [0.22, 1, 0.36, 1] } as any);

  const panelTransition = reduce
    ? { duration: 0 }
    : ({ duration: 0.34, ease: [0.16, 1, 0.3, 1] } as any);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && entry ? (
        <motion.div
          ref={rootRef}
          className="fixed inset-y-0 right-0 z-[55]"
          // left is set live while open; default 0 so it still renders before first rAF
          style={{ left: "0px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          {/* click-anywhere-outside backdrop (dims + blurs the content pane only) */}
          <motion.button
            type="button"
            aria-label="close popup"
            onClick={onClose}
            className={[
              "absolute inset-0 h-full w-full",
              "bg-black/65",
              "supports-[backdrop-filter]:bg-black/40 supports-[backdrop-filter]:backdrop-blur-2xl",
            ].join(" ")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          />

          {/* window */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={entry.title}
            className="absolute left-1/2 -translate-x-1/2 z-10"
            style={{
              top,
              bottom: "calc(var(--footer-h, 0px) + 22px)",
              // consistent side margins even on shrink (~24px each side)
              width: "min(940px, calc(100% - 48px))",
            }}
            initial={
              reduce
                ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, y: 16, scale: 0.985, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, y: 16, scale: 0.985, filter: "blur(10px)" }
            }
            transition={panelTransition}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 shadow-[0_0_70px_rgba(0,0,0,0.78)]">
              {/* x (no circle) */}
              <button
                ref={closeBtnRef}
                type="button"
                aria-label="close"
                onClick={onClose}
                className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                ✕
              </button>

              {/* only this scrolls */}
              <div className="flex-1 min-h-0 overflow-y-auto [overscroll-behavior:contain] [-webkit-overflow-scrolling:touch] touch-pan-y">
                {/* 16:9 header w/ title on image */}
                <header className="relative aspect-video w-full bg-neutral-900">
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
                    <div className="h-full w-full bg-gradient-to-br from-white/[0.08] to-white/[0.02]" />
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                        {entry.kindLabel}
                      </span>
                      <span className="text-xs text-white/70">
                        <time dateTime={entry.date}>{formatDateLocal(entry.date)}</time>
                      </span>
                    </div>

                    <h1 className="mt-3 text-3xl sm:text-4xl font-normal tracking-tight text-white">
                      {entry.title}
                    </h1>
                  </div>
                </header>

                {/* body */}
                <div className="p-5 sm:p-6 pt-5">
                  {entry.summary && (
                    <p className="text-sm sm:text-base text-white/65">{entry.summary}</p>
                  )}
                </div>

                <div className="px-5 pb-10 sm:px-6">
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
