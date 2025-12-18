// components/ExperienceDeck.tsx — DROP-IN REPLACEMENT
"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Parallax from "@/components/Parallax";
import { experienceByYear, type ExperienceItem, type PressHit } from "@/lib/experienceData";

type Mode = "cards" | "timeline";
type ExperienceWithYear = ExperienceItem & { year: string };

function buildItems(): ExperienceWithYear[] {
  const years = Object.keys(experienceByYear).sort((a, b) => Number(b) - Number(a));
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

const DEFAULT_COMMS_PRESS_HITS: PressHit[] = [
  {
    publisher: "CNN",
    href: "https://www.cnn.com/shows/state-of-the-union",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/cnn.png",
  },
  {
    publisher: "Dispatch",
    href: "https://www.dispatch.com/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/dispatch.png",
  },
  {
    publisher: "NYT",
    href: "https://www.nytimes.com/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/nyt.png",
  },
  {
    publisher: "WaPo",
    href: "https://www.washingtonpost.com/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/wapo.png",
  },
  {
    publisher: "Slate",
    href: "https://slate.com/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/slate.png",
  },
  {
    publisher: "Michigan\nAdvance",
    href: "https://michiganadvance.com/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/advance.png",
  },
  {
    publisher: "MLive",
    href: "https://www.mlive.com/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/mlive.png",
  },
  {
    publisher: "RIAA",
    href: "https://www.riaa.com/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/riaa.png",
  },
  {
    publisher: "The\n19th",
    href: "https://19thnews.org/",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/19th.png",
  },
];

export default function ExperienceDeck({
  mode = "timeline",
  fanOutKey, // kept for api compatibility
}: {
  mode?: Mode;
  fanOutKey: string;
  activeYear?: string;
  onActiveYearChange?: (year: string) => void;
}) {
  const items = useMemo(buildItems, []);

  if (!items.length) {
    return (
      <div className="rounded-2xl bg-neutral-900 px-6 py-10 text-sm text-muted">
        no experience entries yet.
      </div>
    );
  }

  // Only timeline is used on the Experience page; keep `mode` for compatibility.
  if (mode !== "timeline") {
    return <ExperienceTimelineList items={items} fanOutKey={fanOutKey} />;
  }

  return <ExperienceTimelineList items={items} fanOutKey={fanOutKey} />;
}

function ExperienceTimelineList({
  items,
  fanOutKey,
}: {
  items: ExperienceWithYear[];
  fanOutKey: string;
}) {
  return (
    <section
      className="relative isolate pb-10 pt-1"
      aria-label="resume timeline"
      data-fan-out-key={fanOutKey}
    >
      {/* clearer dividers */}
      <div className="divide-y divide-neutral-700/80">
        {items.map((item, index) => {
          const key = makeEntryKey(item, index);
          const amount = index % 2 === 0 ? -70 : -55;
          return (
            <Parallax key={key} amount={amount} className="py-8 md:py-10">
              <TimelineEntry item={item} />
            </Parallax>
          );
        })}
      </div>
    </section>
  );
}

function TimelineEntry({ item }: { item: ExperienceWithYear }) {
  const photos: string[] = useMemo(() => {
    const fromList = (item.photos ?? undefined)?.filter(Boolean) ?? [];
    const fromSingle = item.image ? [item.image] : [];
    return fromList.length ? fromList : fromSingle;
  }, [item.photos, item.image]);

  const isCommsDirector =
    item.role.toLowerCase().includes("communications director") ||
    item.org.toLowerCase().includes("house of representatives");

  const pressHits = (item.pressHits?.length ? item.pressHits : undefined) ??
    (isCommsDirector ? DEFAULT_COMMS_PRESS_HITS : []);

  return (
    <article className="relative text-left">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {/* ~15% bigger */}
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

      {/* Link button (between entry and press hits/photos) */}
      {item.link && (
        <div className="mt-5">
          <ResumeLinkButton href={item.link}>
            {item.link_text ?? "view details"}
          </ResumeLinkButton>
        </div>
      )}

      {/* Press hits — ONLY shows when present (or for Comms Director fallback). */}
      {pressHits.length > 0 && (
        <div className="mt-5 -mr-6">
          <PressHitsRail hits={pressHits} ariaLabel="press hits" />
        </div>
      )}

      {/* Scrollable photos — bleeds off the right edge */}
      {photos.length > 0 && (
        <div className="mt-6 -mr-6">
          <PhotoRail photos={photos} ariaLabel={`${item.role} photos`} />
        </div>
      )}
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

// ---------- Shared nav button ----------

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
        disabled ? "cursor-not-allowed text-muted/40" : "text-muted hover:text-foreground",
      ].join(" ")}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );
}

// ---------- Press hits rail (scrollable circles) ----------

const HIT_DIAMETER = 72;
const HIT_GAP = 16;

function PressHitsRail({ hits, ariaLabel }: { hits: PressHit[]; ariaLabel: string }) {
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
    return Math.max(1, Math.floor((viewportW + HIT_GAP) / (HIT_DIAMETER + HIT_GAP)));
  }, [viewportW]);

  const maxIndex = useMemo(
    () => Math.max(0, hits.length - visibleCount),
    [hits.length, visibleCount],
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
          animate={{ x: -index * (HIT_DIAMETER + HIT_GAP) }}
          transition={slideTransition}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 && canNext) setIndex((v) => v + 1);
            else if (info.offset.x > 60 && canPrev) setIndex((v) => v - 1);
          }}
        >
          {hits.map((hit, i) => {
            const Circle = (
              <article
                className="group relative grid flex-shrink-0 place-items-center overflow-hidden rounded-full bg-card shadow-[0_0_18px_rgba(0,0,0,0.35)]"
                style={{ width: HIT_DIAMETER, height: HIT_DIAMETER }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={hit.logo}
                    alt={hit.publisher.replace("\n", " ")}
                    fill
                    className="object-contain p-4"
                    sizes={`${HIT_DIAMETER}px`}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/35" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="whitespace-pre-line text-[10px] font-medium leading-tight text-white">
                      {hit.publisher}
                    </span>
                  </div>
                </div>
              </article>
            );

            if (!hit.href) {
              return (
                <div key={`${hit.publisher}-${i}`} aria-disabled="true" className="block">
                  {Circle}
                </div>
              );
            }

            return (
              <Link
                key={`${hit.href}-${i}`}
                href={hit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus-visible:outline-none"
              >
                {Circle}
              </Link>
            );
          })}
        </motion.div>
      </div>

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
          {Math.min(index + 1, hits.length)} / {hits.length}
        </span>
      </div>
    </section>
  );
}

// ---------- Photo rail (scrollable images) ----------

const PHOTO_W = 260;
const PHOTO_H = 170;
const PHOTO_GAP = 16;

function PhotoRail({ photos, ariaLabel }: { photos: string[]; ariaLabel: string }) {
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
    return Math.max(1, Math.floor((viewportW + PHOTO_GAP) / (PHOTO_W + PHOTO_GAP)));
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
              <Image src={src} alt="" fill className="object-cover" sizes={`${PHOTO_W}px`} />
            </figure>
          ))}
        </motion.div>
      </div>

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
