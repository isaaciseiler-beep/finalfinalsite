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
  const [cardH, setCardH] = useState(420);

  // Detect mode flips so we can make the fan-out feel deliberate (slower + stagger).
  const [prevMode, setPrevMode] = useState<Mode>(mode);
  useEffect(() => setPrevMode(mode), [mode]);

  const cur = items[idx];

  useEffect(() => {
    if (!cur || !onActiveYearChange) return;
    onActiveYearChange(cur.year);
  }, [cur, onActiveYearChange]);

  useEffect(() => {
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
  const isFanning = prevMode !== mode;
  const hasPrev = idx > 0;
  const hasNext = idx < items.length - 1;

  // Intentional, slower fan-out; still responsive for normal navigation.
  const ease = [0.22, 1, 0.36, 1] as any;
  const baseDuration = reduce ? 0.25 : isFanning ? 0.95 : 0.7;

  // Deck stack offsets (no scale/rotate — fixed dimensions; transform only)
  const stackX = [0, 10, 20];
  const stackY = [0, 38, 76];
  const stackOpacity = [1, 0.78, 0.52];

  // Timeline spacing: thin dividers do the separation, so keep the list tight.
  const timelineGap = 0;
  const timelineSlot = cardH + timelineGap;
  const timelineHeight = Math.max(
    cardH,
    items.length * timelineSlot - timelineGap,
  );

  // Used to re-trigger the “fan” feel if parents change keys intentionally.
  // (No behavior changes; only used as a stable render marker.)
  const fanMarker = fanOutKey;

  return (
    <section
      className="relative isolate px-0 pb-8 pt-2 md:pb-10 md:pt-2"
      aria-label="experience cards"
      data-fan-out-key={fanMarker}
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
        style={isCards ? undefined : { height: timelineHeight }}
      >
        {items.map((item, index) => {
          const key = makeCardKey(item, index);
          const offset = index - idx;
          const isActive = index === idx;

          // ----- Position + opacity only -----
          let x = 0;
          let y = 0;
          let opacity = 1;

          if (isCards) {
            if (offset === 0) {
              x = stackX[0];
              y = stackY[0];
              opacity = stackOpacity[0];
            } else if (offset === 1) {
              x = stackX[1];
              y = stackY[1];
              opacity = stackOpacity[1];
            } else if (offset === 2) {
              x = stackX[2];
              y = stackY[2];
              opacity = stackOpacity[2];
            } else {
              // Park everything else at the back of the deck (invisible) so
              // fan-out to timeline looks like it “emanates” from a single deck.
              x = stackX[2];
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

          // Fan-out stagger (only when expanding out of cards mode).
          const fanningToTimeline = !reduce && isFanning && mode === "timeline";
          const dist = Math.abs(index - idx);
          const fanDelay = fanningToTimeline ? Math.min(0.3, dist * 0.03) : 0;

          const cardTransition = {
            duration: baseDuration,
            ease,
            delay: fanDelay,
          };

          // ----- Visual state for “fan-out feel” -----
          // Active deck card: solid background, no lines.
          // Fanned states (stacked cards + timeline): background disappears, lines fade in,
          // and content switches to a tighter (compact) layout.
          const compact = !isCards || offset !== 0;
          const deckStacked = isCards && offset > 0 && offset <= 2;
          const timeline = !isCards;

          const bgOpacity = isCards && offset === 0 ? 1 : 0; // disappear when fanned
          const outlineOpacity = deckStacked ? 1 : 0; // thin outline on stacked cards
          const dividerOpacity =
            timeline && index !== items.length - 1 ? 1 : 0; // thin separators in timeline

          // Stage the “background -> lines -> compact content” subtly.
          const bgTransition = {
            duration: baseDuration * 0.6,
            ease,
            delay: fanDelay,
          };
          const lineTransition = reduce
            ? { duration: baseDuration * 0.6, ease, delay: 0 }
            : {
                duration: baseDuration * 0.55,
                ease,
                delay: fanDelay + 0.08,
              };
          const contentTransition = reduce
            ? { duration: baseDuration * 0.7, ease, delay: 0 }
            : {
                duration: baseDuration * 0.7,
                ease,
                delay: fanDelay + 0.03,
              };

          return (
            <motion.article
              key={key}
              initial={false}
              animate={{ x, y, opacity }}
              transition={cardTransition}
              drag={isCards && isActive ? ("x" as const) : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (!isCards) return;
                if (info.offset.x < -90 && hasNext) setIdx((i) => i + 1);
                else if (info.offset.x > 90 && hasPrev) setIdx((i) => i - 1);
              }}
              onClick={() => {
                if (!isCards) setIdx(index);
              }}
              aria-hidden={isCards && !isActive}
              className={[
                "absolute inset-x-0 top-0 w-full",
                "h-[380px] md:h-[420px]",
                "overflow-hidden rounded-2xl",
                // Keep box sizing stable; all visual changes happen via opacity layers.
                "border border-transparent",
                "focus:outline-none focus-visible:outline-none",
                isCards && !isActive ? "pointer-events-none" : "",
                isCards && isActive ? "cursor-grab active:cursor-grabbing" : "",
              ].join(" ")}
              style={{ zIndex, willChange: "transform" }}
            >
              {/* Background layer (fades out when fanned). */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-neutral-900"
                initial={false}
                animate={{ opacity: bgOpacity }}
                transition={bgTransition}
              />

              {/* Thin outline for stacked deck cards (fades in as background disappears). */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl border border-neutral-800"
                initial={false}
                animate={{ opacity: outlineOpacity }}
                transition={lineTransition}
              />

              {/* Timeline divider line (thin separators; fades in on fan-out). */}
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-neutral-800"
                initial={false}
                animate={{ opacity: dividerOpacity }}
                transition={lineTransition}
              />

              {/* Expanded content (flashcard feel) — shown only for the active deck card. */}
              <motion.div
                className="absolute inset-0 z-10 flex h-full flex-col justify-between px-7 py-7 text-left"
                initial={false}
                animate={{
                  opacity: compact ? 0 : 1,
                  y: compact ? -10 : 0,
                }}
                transition={contentTransition}
                style={{ pointerEvents: compact ? "none" : "auto" }}
                aria-hidden={compact}
              >
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

                {item.link && (
                  <div className="mt-6">
                    <Link
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 rounded-md border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 no-underline transition-colors duration-300 hover:border-neutral-50 hover:bg-neutral-50 hover:text-black hover:no-underline focus-visible:outline-none"
                      onClick={(e) => e.stopPropagation()}
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
              </motion.div>

              {/* Compact content (timeline/fanned) — tighter spacing; background is gone; lines are in. */}
              <motion.div
                className="absolute inset-0 z-10 flex h-full flex-col px-4 py-4 text-left md:px-4 md:py-4"
                initial={false}
                animate={{
                  opacity: compact ? 1 : 0,
                  y: compact ? 0 : 10,
                }}
                transition={contentTransition}
                // Only the active deck card is interactive in cards mode.
                style={{
                  pointerEvents: compact && (!isCards || isActive) ? "auto" : "none",
                }}
                aria-hidden={!compact}
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    {item.dates}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight md:text-xl">
                    {item.role}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{item.org}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.summary}
                  </p>

                  {/* Gap shrink: button sits closer to text (no bottom-pinning). */}
                  {item.link && (
                    <div className="mt-3">
                      <Link
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 rounded-md border border-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-100 no-underline transition-colors duration-300 hover:border-neutral-50 hover:bg-neutral-50 hover:text-black hover:no-underline focus-visible:outline-none"
                        onClick={(e) => e.stopPropagation()}
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
              </motion.div>
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
