// components/ExperienceDeck.tsx — DROP-IN REPLACEMENT
"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Parallax from "@/components/Parallax";
import { experienceByYear, type ExperienceItem } from "@/lib/experienceData";

type Mode = "cards" | "timeline";
type ExperienceWithYear = ExperienceItem & { year: string };

function buildItems(): ExperienceWithYear[] {
  const years = Object.keys(experienceByYear).sort(
    (a, b) => Number(b) - Number(a),
  );

  return years.flatMap((year) =>
    (experienceByYear[year] ?? []).map((item) => ({ ...item, year })),
  );
}

function makeEntryKey(item: ExperienceWithYear, index: number) {
  return `${item.year}-${item.org}-${item.role}-${index}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function ExperienceDeck({
  mode = "cards",
  fanOutKey,
}: {
  mode?: Mode;
  fanOutKey: string;
  activeYear?: string;
  onActiveYearChange?: (year: string) => void;
}) {
  // Timeline is the canonical view for the experience page.
  if (mode === "timeline") {
    return <ExperienceTimelineList fanOutKey={fanOutKey} />;
  }
  return <ExperienceCardsDeck fanOutKey={fanOutKey} />;
}

function ExperienceTimelineList({ fanOutKey }: { fanOutKey: string }) {
  const items = useMemo(buildItems, []);

  if (!items.length) {
    return (
      <div className="rounded-2xl bg-neutral-900 px-6 py-10 text-sm text-muted">
        no experience entries yet.
      </div>
    );
  }

  return (
    <section
      className="relative isolate pb-10 pt-1"
      aria-label="resume timeline"
      data-fan-out-key={fanOutKey}
    >
      {/* clearer separators */}
      <div className="divide-y divide-neutral-700/70">
        {items.map((item, index) => {
          const key = makeEntryKey(item, index);
          const amount = index % 2 === 0 ? -70 : -55;
          return (
            <Parallax key={key} amount={amount} className="py-8 md:py-10">
              <TimelineEntry item={item} index={index} total={items.length} />
            </Parallax>
          );
        })}
      </div>
    </section>
  );
}

function TimelineEntry({
  item,
  index,
  total,
}: {
  item: ExperienceWithYear;
  index: number;
  total: number;
}) {
  const photos: string[] = useMemo(() => {
    const fromList = (item.photos ?? undefined)?.filter(Boolean) ?? [];
    const fromSingle = item.image ? [item.image] : [];
    // Prefer explicit photo list, then fall back to single image.
    return fromList.length ? fromList : fromSingle;
  }, [item.photos, item.image]);

  return (
    <article className="relative text-left">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {/* ~15% bigger than the previous role header */}
          <h3 className="text-[1.45rem] font-semibold tracking-tight md:text-[1.75rem]">
            {item.role}
          </h3>
          <p className="mt-1 text-sm text-muted">{item.org}</p>
        </div>

        {/* grey pill date (no outline) */}
        <div className="shrink-0">
          <span className="inline-flex rounded-full bg-neutral-800/70 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-neutral-200">
            {item.dates}
          </span>
        </div>
      </header>

      <p className="mt-4 text-sm leading-relaxed text-muted">{item.summary}</p>

      {/* link button (between text and photos) */}
      {item.link && (
        <div className="mt-5">
          <ResumeLinkButton href={item.link}>
            {item.link_text ?? "view details"}
          </ResumeLinkButton>
        </div>
      )}

      {/* scrollable photos — bleed off-screen to the right (no right buffer) */}
      {photos.length > 0 && (
        <div className="mt-6 -mx-4 pl-4 sm:-mx-6 sm:pl-6">
          <MediaRail photos={photos} ariaLabel={`${item.role} photos`} />
        </div>
      )}

      {/* trailing breathing room on the last entry */}
      {index === total - 1 && <div className="h-2" />}
    </article>
  );
}

function ResumeLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "group inline-flex max-w-2xl items-start",
        "rounded-2xl bg-neutral-900/40 px-4 py-3",
        "text-sm leading-snug text-neutral-100",
        "no-underline transition-colors hover:bg-neutral-800/60 hover:no-underline",
        "focus-visible:outline-none",
      ].join(" ")}
    >
      <span className="text-muted group-hover:text-foreground">
        {children}
        <span
          aria-hidden
          className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        >
          ↗
        </span>
      </span>
    </Link>
  );
}

// ---------- media rail (per-entry photo carousel) ----------

const PHOTO_W = 260;
const PHOTO_H = 170;
const PHOTO_GAP = 16;

function MediaRail({
  photos,
  ariaLabel,
}: {
  photos: string[];
  ariaLabel: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportW, setViewportW] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => setViewportW(el.clientWidth || 0);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visibleCount = useMemo(() => {
    if (!viewportW) return 1;
    return Math.max(
      1,
      Math.floor((viewportW + PHOTO_GAP) / (PHOTO_W + PHOTO_GAP)),
    );
  }, [viewportW]);

  const maxIndex = useMemo(
    () => Math.max(0, photos.length - visibleCount),
    [photos.length, visibleCount],
  );

  useEffect(() => {
    setIndex((prev) => clamp(prev, 0, maxIndex));
  }, [maxIndex]);

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  const slideTransition = reduce
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.4, 0.0, 0.2, 1] as any };

  return (
    <section aria-label={ariaLabel}>
      <div ref={viewportRef} className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: -index * (PHOTO_W + PHOTO_GAP) }}
          transition={slideTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 && canNext) setIndex((v) => v + 1);
            else if (info.offset.x > 60 && canPrev) setIndex((v) => v - 1);
          }}
        >
          {photos.map((src, i) => (
            <figure
              key={`${src}-${i}`}
              className="relative flex-shrink-0 overflow-hidden rounded-2xl bg-neutral-900 shadow-[0_0_20px_rgba(0,0,0,0.35)]"
              style={{ width: PHOTO_W, height: PHOTO_H }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes={`${PHOTO_W}px`}
              />
            </figure>
          ))}
        </motion.div>
      </div>

      {/* arrows grey out when there is nothing left to scroll */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <CarouselNavButton
            dir="left"
            onClick={() => setIndex((v) => Math.max(0, v - 1))}
            disabled={!canPrev}
          />
          <CarouselNavButton
            dir="right"
            onClick={() => setIndex((v) => Math.min(maxIndex, v + 1))}
            disabled={!canNext}
          />
        </div>
        <span className="tabular-nums">
          {Math.min(index + 1, photos.length)} / {photos.length}
        </span>
      </div>
    </section>
  );
}

// ---------- optional cards mode (kept for API compatibility) ----------

function ExperienceCardsDeck({ fanOutKey }: { fanOutKey: string }) {
  const reduce = useReducedMotion();
  const items = useMemo(buildItems, []);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    setIdx((i) => clamp(i, 0, items.length - 1));
  }, [items.length]);

  const cur = items[idx];
  if (!items.length || !cur) {
    return (
      <div className="rounded-2xl bg-neutral-900 px-6 py-10 text-sm text-muted">
        no experience entries yet.
      </div>
    );
  }

  const hasPrev = idx > 0;
  const hasNext = idx < items.length - 1;

  return (
    <section
      className="relative isolate pb-10 pt-2"
      aria-label="experience cards"
      data-fan-out-key={fanOutKey}
    >
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <CarouselNavButton
            dir="left"
            onClick={() => hasPrev && setIdx((i) => i - 1)}
            disabled={!hasPrev}
          />
          <CarouselNavButton
            dir="right"
            onClick={() => hasNext && setIdx((i) => i + 1)}
            disabled={!hasNext}
          />
        </div>
        <span className="tabular-nums">
          {idx + 1} / {items.length}
        </span>
      </div>

      <motion.article
        key={makeEntryKey(cur, idx)}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.35 }}
        className="rounded-2xl bg-neutral-900 px-7 py-7"
      >
        <span className="inline-flex rounded-full bg-neutral-800/70 px-3 py-1 text-[11px] font-medium tracking-[0.12em] text-neutral-200">
          {cur.dates}
        </span>
        <h3 className="mt-3 text-[1.45rem] font-semibold tracking-tight md:text-[1.75rem]">
          {cur.role}
        </h3>
        <p className="mt-1 text-sm text-muted">{cur.org}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted">{cur.summary}</p>

        {cur.link && (
          <div className="mt-5">
            <ResumeLinkButton href={cur.link}>
              {cur.link_text ?? "view details"}
            </ResumeLinkButton>
          </div>
        )}
      </motion.article>
    </section>
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
