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

  const cur = items[idx];

  useEffect(() => {
    if (!cur || !onActiveYearChange) return;
    onActiveYearChange(cur.year);
  }, [cur, onActiveYearChange]);

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
    ? { duration: 0.3 }
    : { duration: 0.7, ease: [0.3, 0, 0.2, 1] as any };

  return (
    <section
      className="relative isolate px-0 pb-8 pt-2 md:pb-10 md:pt-2"
      aria-label="experience cards"
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
        className={
          isCards
            ? "relative w-full pt-2 pb-2 min-h-[380px] md:min-h-[420px]"
            : "relative w-full space-y-3 pt-2 pb-2"
        }
      >
        {items.map((item, index) => {
          const key = makeCardKey(item, index);
          const isActive = index === idx;
          const offset = index - idx;

          // stacked deck: show only current + next two
          if (isCards) {
            if (offset < 0) return null;
            if (offset > 2) return null;
          }

          // STEP 1: fan-out positions (no scale → text never stretched)
          let animateProps: { x: number; y: number };
          if (isCards) {
            if (offset === 0) {
              animateProps = { x: 0, y: 0 };
            } else if (offset === 1) {
              animateProps = { x: 0, y: 32 };
            } else {
              animateProps = { x: 0, y: 64 };
            }
          } else {
            // timeline layout target
            animateProps = { x: 0, y: 0 };
          }

          // STEP 2 + 3: staged styling for bg + lines + internal gap
          const topBg = "rgb(15,15,15)"; // neutral-900
          const ghostBg = "rgb(7,7,7)"; // darker
          const transparentBg = "rgba(0,0,0,0)";
          const dividerColor = "rgba(38,38,38,1)"; // neutral-800
          const dividerTransparent = "rgba(38,38,38,0)";

          const backgroundColor = isCards
            ? offset === 0
              ? topBg
              : ghostBg
            : transparentBg;

          const borderColor = isCards ? dividerTransparent : dividerColor;

          // gap between text + buttons shrinks in timeline mode
          const paddingBlock = isCards ? 28 : 16; // vertical padding px
          const paddingInline = isCards ? 28 : 16; // horizontal padding px

          const outerBaseCards =
            "overflow-hidden rounded-2xl h-[380px] md:h-[420px] w-full focus:outline-none focus-visible:outline-none";
          const outerBaseTimeline =
            "w-full focus:outline-none focus-visible:outline-none";

          const outerClass = isCards ? outerBaseCards : outerBaseTimeline;

          const positioningClass = isCards
            ? "absolute inset-x-0 top-0"
            : "relative";

          const pointerClass =
            isCards && !isActive ? "pointer-events-none" : "";

          const style: React.CSSProperties = {
            backgroundColor,
            borderColor,
            padding: `${paddingBlock}px ${paddingInline}px`,
            transition:
              // 1) padding (gap) change while cards fan/stack
              "padding 0.55s cubic-bezier(0.3,0,0.2,1)," +
              // 2) card background fades
              "background-color 0.55s cubic-bezier(0.3,0,0.2,1) 0.18s," +
              // 3) lines fade in/out
              "border-color 0.45s cubic-bezier(0.3,0,0.2,1) 0.35s",
            ...(isCards ? { zIndex: 10 - offset } : {}),
          };

          const titleClass = isCards
            ? "mt-3 text-xl font-semibold tracking-tight md:text-2xl"
            : "mt-1.5 text-lg font-semibold tracking-tight md:text-xl";

          const summaryMargin = isCards ? "mt-4" : "mt-2";
          const buttonMargin = isCards ? "mt-6" : "mt-2";

          return (
            <motion.article
              key={key}
              // no layout / layoutId / scale → text never gets squashed
              initial={false}
              animate={animateProps}
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
              onClick={() => setIdx(index)}
              className={[
                outerClass,
                positioningClass,
                pointerClass,
                !isCards ? "border-b last:border-b-0" : "border-b",
              ].join(" ")}
              style={style}
            >
              <div className="flex h-full flex-col justify-between text-left">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    {item.dates}
                  </p>
                  <h3 className={titleClass}>{item.role}</h3>
                  <p className="mt-1 text-sm text-muted">{item.org}</p>
                  <p
                    className={`${summaryMargin} text-sm leading-relaxed text-muted`}
                  >
                    {item.summary}
                  </p>
                </div>

                {item.link && (
                  <div className={buttonMargin}>
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
