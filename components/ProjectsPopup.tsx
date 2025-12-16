"use client";

import { useEffect, useRef } from "react";
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
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !entry) return null;

  // clamp: keep the window starting “where tabs are” when visible, otherwise use a sane top
  const top = Math.max(88, Math.min(topPx, 220));

  return (
    // covers only the content pane; sidebar/logo never dimmed
    <div className="fixed inset-0 z-[40]" style={{ left: "var(--sidebar-offset)" } as any}>
      {/* dim + blur the page behind (content pane only) */}
      <button
        type="button"
        aria-label="close"
        className="absolute inset-0 h-full w-full bg-black/35 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* popup window */}
      <div className="absolute inset-0 px-4 sm:px-6" aria-hidden={false}>
        <div
          className="absolute left-0 right-0 mx-auto w-full max-w-[1040px]"
          style={{ top, bottom: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-card shadow-[0_0_50px_rgba(0,0,0,0.6)]">
            {/* close button */}
            <button
              ref={closeBtnRef}
              type="button"
              aria-label="close"
              onClick={onClose}
              className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-background/70 text-sm text-foreground backdrop-blur transition hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              ✕
            </button>

            {/* only this scrolls */}
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
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              </div>

              {/* meta */}
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground">
                    {entry.kindLabel}
                  </span>
                  <span className="text-xs text-mutefg">
                    <time dateTime={entry.date}>{formatDateLocal(entry.date)}</time>
                  </span>
                </div>

                <h1 className="mt-3 text-2xl sm:text-3xl font-normal tracking-tight">
                  {entry.title}
                </h1>

                {entry.summary && (
                  <p className="mt-3 text-sm sm:text-base text-mutefg">{entry.summary}</p>
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
        </div>
      </div>
    </div>
  );
}
