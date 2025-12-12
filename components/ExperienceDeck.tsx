// components/ExperienceDeck.tsx — DROP-IN REPLACEMENT
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
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

function makeCardKey(item: ExperienceWithYear, index: number) {
  return `${item.year}-${item.org}-${item.role}-${index}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function ExperienceDeck({
  mode = "cards",
  fanOutKey, // kept for api compatibility
  activeYear: _activeYear,
  onActiveYearChange,
}: {
  mode?: Mode;
  fanOutKey: string;
  activeYear?: string;
  onActiveYearChange?: (year: string) => void;
}) {
  const reduce = useReducedMotion();
  const items = useMemo(buildItems, []);
  const [idx, setIdx] = useState(0);

  // Used only to compute timeline spacing without relying on layout animations.
  // Starts at md height to match SSR/hydration, then corrects after mount.
  const [cardH, setCardH] = useState(420);

  const cur = items[idx];

  useEffect(() => {
    if (!cur || !onActiveYearChange) return;
    onActiveYearChange(cur.year);
  }, [cur, onActiveYearChange]);

  useEffect(() => {
    // keep idx safe (defensive; items are memoized but avoids edge cases)
    if (!items.length) return;
    setIdx((i) => clamp(i, 0, items.length - 1));
  }, [items.length]);

  useEffect(() => {
    const update = () => setCardH(window.innerWidth >= 768 ? 420 : 380);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!items.length || !cur) {
    return (
      <div className="rounded-2xl bg-neutral-900 px-6 py-10 text-sm text-muted">
        no experience entries yet.
      </div>
    );
  }

  const isCards = mode === "cards";
  const hasPrev = idx > 0;
  const hasNext = idx < items.length - 1;

  const motionTransition = reduce
    ? { duration: 0.25 }
    : { duration: 0.55, ease: [0.3, 0, 0.2, 1] as any };

  // Deck feel: fixed card dimensions; animate transform (x/y) + opacity only.
  const stackY = [0, 32, 64];
  const stackOpacity = [1, 0.72, 0.44];
  const exitX = 180;

  // Timeline fan-out: cards spread vertically (still fixed height).
  const timelineGap = 18;
  const timelineSlot = cardH + timelineGap;
  const timelineHeight = Math.max(
    cardH,
    items.length * timelineSlot - timelineGap,
  );

  return (
    <section
      className="relative isolate px-0 pb-8 pt-2 md:pb-10 md:pt-2"
      aria-label="experience cards"
      data-fan-out-key={fanOutKey}
    >
      {/* nav row — top, arrows left, progress right, only in cards mode */}
      {isCards && (
        <div className="mb-4 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-3">
            <NavButton
              dir="left"
              disabled={!hasPrev}
              onClick={() => hasPrev && setIdx((i) => i - 1)}
            />
            <NavButton
              dir="right"
              disabled={!hasNext}
              onClick={() => hasNext && setIdx((i) => i + 1)}
            />
          </div>
          <span className="tabular-nums">
            {idx + 1} / {items.length}
          </span>
        </div>
      )}

      <div
        className={[
          "relative w-full",
          isCards ? "min-h-[380px] md:min-h-[420px]" : "",
        ].join(" ")}
        // In timeline mode, cards are absolutely positioned; set an explicit height.
        style={isCards ? undefined : { height: timelineHeight }}
      >
        {items.map((item, index) => {
          const key = makeCardKey(item, index);

          const offset = index - idx;
          const isActive = offset === 0;

          // Target transform/opacity only (no scale, no layout, no padding/bg animations).
          let x = 0;
          let y = 0;
          let opacity = 1;

          if (isCards) {
            if (offset === 0) {
              x = 0;
              y = stackY[0];
              opacity = stackOpacity[0];
            } else if (offset === 1) {
              x = 0;
              y = stackY[1];
              opacity = stackOpacity[1];
            } else if (offset === 2) {
              x = 0;
              y = stackY[2];
              opacity = stackOpacity[2];
            } else if (offset < 0) {
              // past cards: park off to the left, fully transparent
              x = -exitX;
              y = 0;
              opacity = 0;
            } else {
              // far-future cards: park off to the right, fully transparent
              x = exitX;
              y = stackY[2];
              opacity = 0;
            }
          } else {
            x = 0;
            y = index * timelineSlot;
            opacity = 1;
          }

          const zIndex = isCards
            ? offset === 0
              ? 30
              : offset === 1
                ? 20
                : offset === 2
                  ? 10
                  : 0
            : 1;

          return (
            <motion.article
              key={key}
              // No layout/layoutId; no scale. Only transform + opacity.
              initial={false}
              animate={{ x, y, opacity }}
              transition={motionTransition}
              drag={isCards && isActive ? ("x" as const) : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (!isCards) return;
                if (info.offset.x < -90 && hasNext) {
                  setIdx((i) => i + 1);
                } else if (info.offset.x > 90 && hasPrev) {
                  setIdx((i) => i - 1);
                }
              }}
              onClick={() => {
                if (!isCards) setIdx(index);
              }}
              aria-hidden={isCards && !isActive}
              className={[
                "absolute inset-x-0 top-0 w-full",
                "overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900",
                "h-[380px] md:h-[420px]",
                "focus:outline-none focus-visible:outline-none",
                isCards && !isActive ? "pointer-events-none" : "",
                isCards && isActive ? "cursor-grab active:cursor-grabbing" : "",
              ].join(" ")}
              style={{ zIndex, willChange: "transform" }}
            >
              <div className="flex h-full flex-col justify-between px-7 py-7 text-left md:px-7 md:py-7">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    {item.dates}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
                    {item.role}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{item.org}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {item.summary}
                  </p>
                </div>

                {/* In cards mode, only the active card exposes interactive content. */}
                {item.link && (!isCards || isActive) && (
                  <div className="mt-6">
                    <Link
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 no-underline transition-colors duration-300 hover:border-neutral-50 hover:bg-neutral-50 hover:text-black hover:no-underline focus-visible:outline-none"
                    >
                      <span className="normal-case">
                        {item.link_text ?? "view details"}
                      </span>
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      >
                        ↗
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function NavButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "previous" : "next"}
      disabled={disabled}
      onClick={onClick}
      className={[
        "h-8 w-8 text-sm text-muted transition-colors focus-visible:outline-none",
        disabled ? "opacity-30" : "hover:text-foreground",
      ].join(" ")}
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );
}
