// components/ExperienceDeck.tsx — DROP-IN REPLACEMENT
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  experienceItems,
  type ExperiencePhoto,
  type PressHit,
} from "@/lib/experienceData";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type Props = {
  mode: "cards" | "timeline";
  fanOutKey?: string;
};

const GAP = 16; // gap-4

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function renderCaption(caption: string) {
  const parts = caption.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, idx) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="not-italic italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function ExperienceDeck({ mode, fanOutKey = "exp" }: Props) {
  // per your request: no filters; always reverse-chrono list
  // (mode kept only for API compatibility)
  const items = useMemo(() => experienceItems, []);

  return (
    <div className="w-full overflow-x-hidden">
      <div className="grid gap-10 md:gap-12">
        {items.map((it, idx) => (
          <article
            key={`${fanOutKey}-${idx}`}
            className="w-full border-b border-border/60 pb-10 last:border-b-0 last:pb-0"
          >
            {/* dates (unchanged) */}
            <div className="text-xs uppercase tracking-[0.2em] text-muted">
              {it.dates}
            </div>

            {/* 10% bigger text + normal spacing */}
            <h3 className="mt-2 text-[22px] font-medium leading-snug md:text-[24px]">
              {it.role}
            </h3>
            <div className="mt-1 text-[16.5px] leading-normal text-muted md:text-[18px]">
              {it.org}
            </div>

            <p className="mt-4 max-w-full text-[16.5px] leading-normal text-muted md:text-[18px]">
              {it.summary}
            </p>

            {/* restore buttons (below description, above photos) */}
            {it.link ? (
              <div className="mt-4">
                <ResumeLinkPill
                  href={it.link}
                  label={it.link_text ?? `open link for ${it.role}`}
                />
              </div>
            ) : null}

            {it.photos?.length ? (
              <div className="mt-6">
                <ResumePhotoCarousel photos={it.photos} />
              </div>
            ) : null}

            {it.pressHits?.length ? (
              <div className="mt-7">
                <div className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  Press Hits
                </div>
                <PressHitsGrid hits={it.pressHits} />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function ResumeLinkPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background/20 px-4 text-sm text-muted transition-colors hover:bg-background/40 hover:text-foreground focus-visible:outline-none"
    >
      <span className="text-base leading-none">↗</span>
    </Link>
  );
}

function ResumePhotoCarousel({ photos }: { photos: ExperiencePhoto[] }) {
  const reduce = useReducedMotion();

  const count = photos.length;
  const hasMany = count > 1;

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);

  const [viewportW, setViewportW] = useState(0);
  const [cardW, setCardW] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => setViewportW(el.clientWidth || 0);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = firstCardRef.current;
    if (!el) return;

    const update = () => setCardW(el.clientWidth || 0);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [count]);

  const step = useMemo(() => {
    if (!cardW) return 0;
    return cardW + GAP;
  }, [cardW]);

  const visibleCount = useMemo(() => {
    if (!viewportW || !step) return 1;
    return Math.max(1, Math.floor((viewportW + GAP) / step));
  }, [viewportW, step]);

  const maxIndex = useMemo(() => {
    return Math.max(0, count - visibleCount);
  }, [count, visibleCount]);

  useEffect(() => {
    setIndex((prev) => clamp(prev, 0, maxIndex));
  }, [maxIndex]);

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  const goPrev = () => setIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setIndex((prev) => Math.min(maxIndex, prev + 1));

  const slideTransition = reduce
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.4, 0.0, 0.2, 1] as any };

  return (
    <div className="relative overflow-x-hidden">
      {/* side fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background via-background/70 to-transparent sm:w-12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background via-background/70 to-transparent sm:w-12" />

      {/* lock browser horizontal panning; arrows handle navigation */}
      <div ref={viewportRef} className="overflow-hidden" style={{ touchAction: "pan-y" }}>
        <motion.div
          className="flex gap-4"
          animate={{ x: -index * step }}
          transition={slideTransition}
        >
          {photos.map((p, i) => (
            <div
              key={`${p.src}-${i}`}
              ref={i === 0 ? firstCardRef : undefined}
              className="flex-shrink-0 w-[88%] max-w-[980px] sm:w-[72%] lg:w-[62%] 2xl:w-[56%]"
            >
              {/* 16:9 everywhere */}
              <article className="aspect-video w-full overflow-hidden rounded-2xl bg-card shadow-[0_0_20px_rgba(0,0,0,0.35)]">
                <div className="relative h-full w-full">
                  <Image
                    src={p.src}
                    alt="resume photo"
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  {/* narrower bottom gradient */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    {/* caption ~20% bigger */}
                    <p className="text-sm leading-snug text-neutral-50 md:text-base">
                      {renderCaption(p.caption)}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </motion.div>
      </div>

      {hasMany ? (
        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <CarouselNavButton dir="left" onClick={goPrev} disabled={!canPrev} />
            <CarouselNavButton dir="right" onClick={goNext} disabled={!canNext} />
          </div>
          <span className="tabular-nums">
            {index + 1} / {count}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function PressHitsGrid({ hits }: { hits: PressHit[] }) {
  const primaryThumb = (url: string) =>
    `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=900`;
  const fallbackThumb = (url: string) =>
    `https://image.thum.io/get/width/900/${encodeURIComponent(url)}`;

  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
      {hits.map((h, idx) => (
        <PressHitCircle
          key={`${h.href}-${idx}`}
          href={h.href}
          publisher={h.publisher}
          title={h.title}
          primarySrc={h.image || primaryThumb(h.href)}
          fallbackSrc={fallbackThumb(h.href)}
        />
      ))}
    </div>
  );
}

function PressHitCircle({
  href,
  publisher,
  title,
  primarySrc,
  fallbackSrc,
}: {
  href: string;
  publisher: string;
  title: string;
  primarySrc: string;
  fallbackSrc: string;
}) {
  const [src, setSrc] = useState(primarySrc);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square w-full overflow-hidden rounded-full border border-border bg-card shadow-subtle focus-visible:outline-none"
      style={{ touchAction: "pan-y" }}
      aria-label={`${publisher}: ${title}`}
    >
      <img
        src={src}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
        onError={() => {
          setSrc((prev) => (prev === primarySrc ? fallbackSrc : prev));
        }}
      />

      {/* always-on story-style overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 p-3">
        <div className="inline-flex rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-100">
          {publisher}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <div className="w-full rounded-full bg-black/60 px-3 py-2 text-[11px] leading-tight text-neutral-100">
          {title}
        </div>
      </div>
    </a>
  );
}

function CarouselNavButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "previous" : "next"}
      onClick={onClick}
      disabled={disabled}
      className={[
        "grid h-9 w-9 place-items-center text-xs transition-colors focus-visible:outline-none",
        disabled
          ? "cursor-not-allowed text-muted/40"
          : "text-muted hover:text-foreground",
      ].join(" ")}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );
}

