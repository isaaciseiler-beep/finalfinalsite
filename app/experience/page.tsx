// app/experience/page.tsx — DROP-IN REPLACEMENT
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/Container";
import ExperienceDeck from "@/components/ExperienceDeck";
import EducationPopup from "@/components/EducationPopup";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

type Mode = "cards" | "timeline";

export const dynamic = "force-static";

type PressItem = {
  title: string;
  href: string;
  source?: string;
  image?: string;
};

const pressItems: PressItem[] = [
  {
    title: "Featured in launch of ChatGPT Pulse",
    href: "https://openai.com/index/introducing-chatgpt-pulse/",
    source: "OpenAI",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/pulse.jpg",
  },
  {
    title: "OpenAI Instagram spotlight on ChatGPT Study Mode",
    href: "https://www.instagram.com/chatgpt/reel/DNyG5VvXEZM/",
    source: "OpenAI",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/study-mode.jpg",
  },
  {
    title: "WashU Rhodes Scholar finalist",
    href:
      "https://source.wustl.edu/2024/11/seniors-darden-seiler-were-rhodes-scholars-finalists/",
    source: "Rhodes Trust",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/rhodes.jpg",
  },
  {
    title: "Co-published Book on Education Uses of ChatGPT",
    href: "https://chatgpt.com/100chats-project",
    source: "OpenAI",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/100chats.jpg",
  },
  {
    title: "Awarded 2024 Michigan Truman Scholarship",
    href: "https://source.washu.edu/2024/04/junior-seiler-awarded-truman-scholarship/",
    source: "Washington University",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/truman.jpg",
  },
  {
    title: "Awarded 2025 Fulbright to Taiwan",
    href:
      "https://source.wustl.edu/2025/06/several-alumni-earn-fulbright-awards/",
    source: "Washington University",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/fulbright.jpg",
  },

  // added items (end, but before university profile)
  {
    title: "Truman Scholarship Q+A",
    href: "",
    source: "Student Life",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/trumanisaac.jpg",
  },
  {
    title: "60 Truman Scholars Announced For 2024",
    href: "",
    source: "Forbes",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/harrytruman.jpg",
  },
  {
    title: "Included in the best newspaper honor at Missouri College Media awards",
    href: "",
    source: "Washington University",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/washuspring.png",
  },

  {
    title: "University profile",
    href:
      "https://artsci.washu.edu/ampersand/isaac-seiler-setting-his-sights-high",
    source: "Washington University",
    image:
      "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/press/wustl.jpg",
  },
];

const CARD_WIDTH = 220; // px
const CARD_GAP = 16; // px, matches gap-4

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function ExperiencePage() {
  // resume stays in expanded mode (no switch)
  const mode: Mode = "timeline";

  const [eduOpen, setEduOpen] = useState(false);
  const [activeYear, setActiveYear] = useState<string>("2025");

  const [pressIndex, setPressIndex] = useState(0);
  const reduce = useReducedMotion();

  const pressCount = pressItems.length;
  const hasPress = pressCount > 0;

  // clamp carousel so you can fully see the last tile, but never scroll past it
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
    // +CARD_GAP so exact-fit math behaves well
    return Math.max(
      1,
      Math.floor((viewportW + CARD_GAP) / (CARD_WIDTH + CARD_GAP)),
    );
  }, [viewportW]);

  const maxPressIndex = useMemo(() => {
    return Math.max(0, pressCount - visibleCount);
  }, [pressCount, visibleCount]);

  useEffect(() => {
    setPressIndex((prev) => clamp(prev, 0, maxPressIndex));
  }, [maxPressIndex]);

  const canPrev = pressIndex > 0;
  const canNext = pressIndex < maxPressIndex;

  const goPrevPress = () => {
    if (!hasPress) return;
    setPressIndex((prev) => Math.max(0, prev - 1));
  };

  const goNextPress = () => {
    if (!hasPress) return;
    setPressIndex((prev) => Math.min(maxPressIndex, prev + 1));
  };

  const slideTransition = reduce
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.4, 0.0, 0.2, 1] as any };

  return (
    <Container>
      {/* cancel Container's side padding so content hits the pane edge */}
      <div className="-mx-4 sm:-mx-6">
        {/* reintroduce inner padding for readable layout */}
        <div className="px-4 sm:px-6 pt-[112px] md:pt-[112px]">
          {/* education header + popup (replaces Experience header) */}
          <section className="pb-4 md:pb-5">
            <EducationPopup
              open={eduOpen}
              onToggle={() => setEduOpen((v) => !v)}
            />
          </section>

          {/* in the news reel – clamped (no wrap), no end gap */}
          {hasPress && (
            <section className="mb-5 md:mb-6">
              <div className="relative">
                {/* side gradients */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background via-background/70 to-transparent sm:w-16 md:w-20" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/70 to-transparent sm:w-16 md:w-20" />

                {/* viewport */}
                <div ref={viewportRef} className="overflow-hidden">
                  <motion.div
                    className="flex gap-4"
                    animate={{ x: -pressIndex * (CARD_WIDTH + CARD_GAP) }}
                    transition={slideTransition}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60 && canNext) goNextPress();
                      else if (info.offset.x > 60 && canPrev) goPrevPress();
                    }}
                  >
                    {pressItems.map((item, idx) => {
                      const Card = (
                        <article className="h-[320px] w-[220px] overflow-hidden rounded-2xl bg-card shadow-[0_0_20px_rgba(0,0,0,0.35)] md:h-[360px]">
                          <div className="relative h-full w-full">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="220px"
                              />
                            ) : (
                              <div className="h-full w-full bg-neutral-800" />
                            )}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                              {item.source && (
                                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-300/80">
                                  {item.source}
                                </div>
                              )}
                              <h3 className="mt-2 text-sm font-semibold leading-snug text-neutral-50 md:text-base">
                                {item.title}
                              </h3>
                            </div>
                          </div>
                        </article>
                      );

                      // avoid invalid next/link href="" for items without provided links
                      if (!item.href) {
                        return (
                          <div
                            key={`${item.title}-${idx}`}
                            className="block flex-shrink-0"
                            aria-disabled="true"
                          >
                            {Card}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={`${item.href}-${idx}`}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block flex-shrink-0 focus-visible:outline-none"
                        >
                          {Card}
                        </Link>
                      );
                    })}
                  </motion.div>
                </div>
              </div>

              {/* controls: no wrap; disable at ends */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-2">
                  <CarouselNavButton
                    dir="left"
                    onClick={goPrevPress}
                    disabled={!canPrev}
                  />
                  <CarouselNavButton
                    dir="right"
                    onClick={goNextPress}
                    disabled={!canNext}
                  />
                </div>
                <span className="tabular-nums">
                  {pressIndex + 1} / {pressCount}
                </span>
              </div>
            </section>
          )}

          {/* my resume header (experience style, anchored left) */}
          <section className="mt-6 mb-4 md:mt-7 md:mb-5">
            <div className="flex justify-start">
              <h2 className="text-left text-5xl font-normal leading-none tracking-tight md:text-7xl">
                My Resume
              </h2>
            </div>
          </section>

          {/* resume (expanded only; no switch; no card mode) */}
          <section aria-label="resume" className="relative">
            <div className="relative pt-1">
              <Suspense
                fallback={
                  <div className="px-4 py-8 text-sm text-muted">loading…</div>
                }
              >
                <ExperienceDeck
                  mode={mode}
                  fanOutKey="experience"
                  activeYear={activeYear}
                  onActiveYearChange={setActiveYear}
                />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </Container>
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
      aria-label={dir === "left" ? "previous card" : "next card"}
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
