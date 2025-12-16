import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { experienceByYear, type ExperienceItem, type ExperiencePhoto, type PressHit } from "@/lib/experienceData";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type Props = {
  mode: "cards" | "timeline";
  fanOutKey?: string;
  activeYear?: string;
  onActiveYearChange?: (y: string) => void;
};

const yearTabs = ["2025", "2024", "2023", "2022", "2021"] as const;

const GAP = 16; // gap-4

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function renderCaption(caption: string) {
  // supports *italic* segments
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

export default function ExperienceDeck({
  mode,
  fanOutKey = "exp",
  activeYear = "2025",
  onActiveYearChange,
}: Props) {
  const [year, setYear] = useState(activeYear);

  useEffect(() => {
    setYear(activeYear);
  }, [activeYear]);

  const items = useMemo(() => experienceByYear[year] ?? [], [year]);

  const setActive = (y: string) => {
    setYear(y);
    onActiveYearChange?.(y);
  };

  if (mode === "cards") {
    return (
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {yearTabs.map((y) => {
            const active = y === year;
            return (
              <button
                key={y}
                type="button"
                onClick={() => setActive(y)}
                className={
                  active
                    ? "rounded-full bg-foreground px-4 py-2 text-[15.5px] text-background"
                    : "rounded-full border border-border px-4 py-2 text-[15.5px] text-muted hover:text-foreground"
                }
              >
                {y}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {items.map((it, idx) => (
            <motion.article
              key={`${fanOutKey}-${year}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-subtle"
            >
              <div className="text-xs uppercase tracking-[0.2em] text-muted">{it.dates}</div>
              <h3 className="mt-2 text-[19.8px] font-medium leading-snug md:text-[22px]">
                {it.role}
              </h3>
              <div className="mt-1 text-[15.5px] text-muted">{it.org}</div>
              <p className="mt-4 text-[15.5px] leading-normal text-muted">{it.summary}</p>

              {it.link ? (
                <div className="mt-5">
                  <ResumeLinkPill href={it.link} label={it.link_text ?? "open"} />
                </div>
              ) : null}
            </motion.article>
          ))}
        </div>
      </div>
    );
  }

  // expanded/timeline view
  return (
    <div className="mt-6">
      {/* year tabs */}
      <div className="flex flex-wrap gap-2">
        {yearTabs.map((y) => {
          const active = y === year;
          return (
            <button
              key={y}
              type="button"
              onClick={() => setActive(y)}
              className={
                active
                  ? "rounded-full bg-foreground px-4 py-2 text-[15.5px] text-background"
                  : "rounded-full border border-border px-4 py-2 text-[15.5px] text-muted hover:text-foreground"
              }
            >
              {y}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-subtle md:p-10">
        <div className="grid gap-10 md:gap-12">
          {items.map((it, idx) => (
            <div
              key={`${fanOutKey}-${year}-${idx}`}
              className="grid gap-4 border-b border-border/60 pb-10 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted">{it.dates}</div>
                  <h3 className="mt-2 text-[19.8px] font-medium leading-snug md:text-[22px]">
                    {it.role}
                  </h3>
                  <div className="mt-1 text-[15.5px] leading-normal text-muted">{it.org}</div>
                </div>

                {it.link ? (
                  <ResumeLinkPill href={it.link} label={it.link_text ?? "open"} />
                ) : null}
              </div>

              <p className="max-w-3xl text-[15.5px] leading-normal text-muted">{it.summary}</p>

              {it.photos?.length ? (
                <div className="pt-1">
                  <ResumePhotoCarousel photos={it.photos} />
                </div>
              ) : null}

              {it.pressHits?.length ? (
                <div className="pt-3">
                  <div className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    Press Hits
                  </div>
                  <PressHitsGrid hits={it.pressHits} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
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
    // +GAP for nicer exact-fit math
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
    <div className="relative">
      {/* side fades (same treatment as press) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background via-background/70 to-transparent sm:w-12" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background via-background/70 to-transparent sm:w-12" />

      <div ref={viewportRef} className="overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{ x: -index * step }}
          transition={slideTransition}
          drag={hasMany ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (!hasMany) return;
            if (info.offset.x < -60 && canNext) goNext();
            else if (info.offset.x > 60 && canPrev) goPrev();
          }}
        >
          {photos.map((p, i) => (
            <div
              key={`${p.src}-${i}`}
              ref={i === 0 ? firstCardRef : undefined}
              className="flex-shrink-0"
            >
              <article className="h-[240px] w-[min(820px,82vw)] overflow-hidden rounded-2xl bg-card shadow-[0_0_20px_rgba(0,0,0,0.35)] md:h-[260px]">
                <div className="relative h-full w-full">
                  <Image
                    src={p.src}
                    alt="resume photo"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 82vw, 820px"
                  />
                  {/* narrower bottom gradient */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <p className="text-xs leading-snug text-neutral-50 md:text-sm">
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
  const thumb = (url: string) =>
    `https://image.thum.io/get/width/900/${encodeURIComponent(url)}`;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {hits.map((h, idx) => {
        const imgSrc = h.image || thumb(h.href);
        return (
          <a
            key={`${h.href}-${idx}`}
            href={h.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square w-full overflow-hidden rounded-full border border-border bg-card shadow-subtle focus-visible:outline-none"
          >
            {/* use <img> to avoid next/image domain restrictions */}
            <img
              src={imgSrc}
              alt={h.title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
            />

            {/* hover overlay */}
            <div className="absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />

            <div className="pointer-events-none absolute inset-x-0 top-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <div className="inline-flex rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-100">
                {h.publisher}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <div className="w-full rounded-full bg-black/60 px-3 py-2 text-[11px] leading-tight text-neutral-100">
                {h.title}
              </div>
            </div>
          </a>
        );
      })}
    </div>
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
