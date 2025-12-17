// app/experience/page.tsx — DROP-IN REPLACEMENT
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/Container";
import EducationPopup from "@/components/EducationPopup";
import ExperienceDeck from "@/components/ExperienceDeck";
import Parallax from "@/components/Parallax";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-static";

type PressItem = {
  publisher: string;
  href?: string;
  logo: string;
};

// Logo-only press reel (publisher names appear on hover).
// Put CNN first (requested).
const pressItems: PressItem[] = [
  {
    publisher: "CNN",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/cnn.png",
  },
  {
    publisher: "Dispatch",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/dispatch.png",
  },
  {
    publisher: "NYT",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/nyt.png",
  },
  {
    publisher: "WaPo",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/wapo.png",
  },
  {
    publisher: "Slate",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/slate.png",
  },
  {
    publisher: "Michigan\nAdvance",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/advance.png",
  },
  {
    publisher: "MLive",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/mlive.png",
  },
  {
    publisher: "RIAA",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/riaa.png",
  },
  {
    publisher: "The\n19th",
    href: "",
    logo: "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/media-portfolio/19th.png",
  },
];

// Larger by ~15% vs 96px, but still "small" vs the old 220px cards.
const LOGO_DIAMETER = 110; // px
const LOGO_GAP = 16; // px (gap-4)

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function ExperiencePage() {
  const [eduOpen, setEduOpen] = useState(false);

  const [pressIndex, setPressIndex] = useState(0);
  const reduce = useReducedMotion();

  const pressCount = pressItems.length;
  const hasPress = pressCount > 0;

  // Clamp carousel so the last tile can be fully visible, but never scroll past it.
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
      Math.floor((viewportW + LOGO_GAP) / (LOGO_DIAMETER + LOGO_GAP)),
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
      {/* prevent any horizontal overflow / sideways page scroll */}
      <div className="-mx-4 sm:-mx-6 overflow-x-hidden">
        <div className="px-4 sm:px-6 pt-[112px] md:pt-[112px]">
          {/* education */}
          <Parallax amount={-70}>
            <section className="pb-5 md:pb-6">
              <EducationPopup
                open={eduOpen}
                onToggle={() => setEduOpen((v) => !v)}
              />
            </section>
          </Parallax>

          {/* news header */}
          {hasPress && (
            <Parallax amount={-55}>
              <section className="mb-4 md:mb-5">
                <div className="flex justify-start">
                  <h2 className="text-left text-4xl font-normal leading-none tracking-tight md:text-6xl">
                    News
                  </h2>
                </div>
              </section>
            </Parallax>
          )}

          {/* press carousel (no right buffer; bleeds off-screen to the right) */}
          {hasPress && (
            <Parallax amount={-90}>
              <section className="mb-7 md:mb-8">
                <div className="relative">
                  {/* Only fade on the left; right edge should feel un-bezeled/flush. */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background via-background/70 to-transparent sm:w-14 md:w-16" />

                  {/* cancel inner padding only for this scroller: keep left padding, remove right */}
                  <div className="-mx-4 pl-4 sm:-mx-6 sm:pl-6">
                    <div ref={viewportRef} className="overflow-hidden">
                      <motion.div
                        className="flex gap-4"
                        animate={{ x: -pressIndex * (LOGO_DIAMETER + LOGO_GAP) }}
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
                          const Circle = (
                            <article
                              className="group relative grid flex-shrink-0 place-items-center overflow-hidden rounded-full bg-card shadow-[0_0_20px_rgba(0,0,0,0.35)]"
                              style={{ width: LOGO_DIAMETER, height: LOGO_DIAMETER }}
                            >
                              <div className="relative h-full w-full">
                                <Image
                                  src={item.logo}
                                  alt={item.publisher.replace("\n", " ")}
                                  fill
                                  className="object-contain p-5"
                                  sizes={`${LOGO_DIAMETER}px`}
                                />
                                {/* hover overlay: slightly darken + show publisher name */}
                                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/35" />
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-3 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                  <span className="whitespace-pre-line text-[11px] font-medium leading-tight text-white">
                                    {item.publisher}
                                  </span>
                                </div>
                              </div>
                            </article>
                          );

                          // Empty href means non-clickable (but still visible).
                          if (!item.href) {
                            return (
                              <div
                                key={`${item.publisher}-${idx}`}
                                className="block"
                                aria-disabled="true"
                              >
                                {Circle}
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={`${item.href}-${idx}`}
                              href={item.href}
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
                  </div>
                </div>

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
            </Parallax>
          )}

          {/* resume header */}
          <Parallax amount={-55}>
            <section className="mb-4 md:mb-5">
              <div className="flex justify-start">
                <h2 className="text-left text-4xl font-normal leading-none tracking-tight md:text-6xl">
                  Resume
                </h2>
              </div>
            </section>
          </Parallax>

          {/* resume list */}
          <section aria-label="resume" className="relative overflow-x-hidden">
            <Suspense
              fallback={<div className="px-4 py-8 text-sm text-muted">loading…</div>}
            >
              <ExperienceDeck mode="timeline" fanOutKey="experience" />
            </Suspense>
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
