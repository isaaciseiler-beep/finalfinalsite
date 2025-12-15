// app/experience/page.tsx — DROP-IN REPLACEMENT
"use client";

import { Suspense, useState } from "react";
import Container from "@/components/Container";
import ExperienceDeck from "@/components/ExperienceDeck";
import EducationPopup from "@/components/EducationPopup";
import ViewSwitch from "@/components/ViewSwitch";
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

export default function ExperiencePage() {
  const [mode, setMode] = useState<Mode>("cards");
  const [eduOpen, setEduOpen] = useState(false);
  const [activeYear, setActiveYear] = useState<string>("2025");
  const [pressIndex, setPressIndex] = useState(0);
  const reduce = useReducedMotion();

  const pressCount = pressItems.length;
  const hasPress = pressCount > 0;

  const goPrevPress = () => {
    if (!hasPress) return;
    setPressIndex((prev) => (prev - 1 + pressCount) % pressCount);
  };

  const goNextPress = () => {
    if (!hasPress) return;
    setPressIndex((prev) => (prev + 1) % pressCount);
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
          {/* header */}
          <section className="relative min-h-[40vh] pb-4 md:pb-6">
            <div className="flex justify-end">
              <h1 className="text-right text-5xl font-normal leading-none tracking-tight md:text-7xl">
                Experience
              </h1>
            </div>

            <div className="mt-10 md:mt-12 flex justify-end">
              <p className="max-w-xl text-right text-lg leading-relaxed text-muted md:text-xl">
                lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </section>

          {/* education pill */}
          <section className="mb-6 flex flex-col gap-4 md:mb-8">
            <EducationPopup
              open={eduOpen}
              onToggle={() => setEduOpen((v) => !v)}
            />
          </section>

          {/* in the news reel – vertical "story" cards, multiple visible at once */}
          {hasPress && (
            <section className="mb-8 md:mb-10">
              <div className="relative">
                {/* side gradients, flex with container width */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background via-background/70 to-transparent sm:w-16 md:w-20" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background via-background/70 to-transparent sm:w-16 md:w-20" />

                {/* track */}
                <div className="overflow-hidden">
                  <motion.div
                    className="flex gap-4"
                    animate={{ x: -pressIndex * (CARD_WIDTH + CARD_GAP) }}
                    transition={slideTransition}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -60) {
                        goNextPress();
                      } else if (info.offset.x > 60) {
                        goPrevPress();
                      }
                    }}
                  >
                    {pressItems.map((item, idx) => (
                      <Link
                        key={`${item.href}-${idx}`}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block flex-shrink-0 focus-visible:outline-none"
                      >
                        {/* tall, vertical story-style card */}
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
                            {/* dark bottom gradient for headline overlay */}
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
                      </Link>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* controls at bottom: arrows left, progress right */}
              <div className="mt-4 flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-2">
                  <CarouselNavButton dir="left" onClick={goPrevPress} />
                  <CarouselNavButton dir="right" onClick={goNextPress} />
                </div>
                <span className="tabular-nums">
                  {pressIndex + 1} / {pressCount}
                </span>
              </div>
            </section>
          )}

          {/* view switcher below tiles */}
          <div className="mb-10 flex items-center justify-center md:mb-12">
            <ViewSwitch mode={mode} onChange={setMode} />
          </div>

          {/* unified deck / spread */}
          <section aria-label="experience views" className="relative">
            <div className="relative pt-2">
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
}: {
  dir: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "previous card" : "next card"}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none"
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );
}
