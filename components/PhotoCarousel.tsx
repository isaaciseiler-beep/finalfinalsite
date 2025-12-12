// components/PhotoCarousel.tsx — DROP-IN REPLACEMENT
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const R2_BASE_URL =
  process.env.NEXT_PUBLIC_R2_BASE_URL ??
  "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/photos";

const PHOTO_COUNT = 139;

// bump this string to force a new 9-photo set
const SESSION_KEY = "photoCarouselSelection_v4";

// base layout positions (% inside inner square) to make a loose circle
const BASE_LAYOUT = [
  { top: 32, left: 32, rotate: -4, z: 50 }, // center
  { top: 14, left: 20, rotate: -18, z: 42 },
  { top: 14, left: 46, rotate: 17, z: 40 },
  { top: 30, left: 8, rotate: -11, z: 38 },
  { top: 50, left: 52, rotate: 12, z: 36 },
  { top: 58, left: 22, rotate: 8, z: 34 },
  { top: 58, left: 46, rotate: -7, z: 32 },
  { top: 40, left: 58, rotate: 7, z: 30 },
  { top: 10, left: 32, rotate: 10, z: 28 },
];

function pickUniqueNumbers(count: number, min: number, max: number) {
  const total = max - min + 1;
  const arr = Array.from({ length: total }, (_, i) => min + i);

  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (total - i));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }

  return arr.slice(0, count);
}

function isValidSelection(nums: unknown): nums is number[] {
  if (!Array.isArray(nums) || nums.length !== 9) return false;
  const set = new Set(nums);
  if (set.size !== 9) return false;
  return nums.every(
    (n) => Number.isFinite(n) && n >= 1 && n <= PHOTO_COUNT && Math.floor(n) === n,
  );
}

function loadOrCreateSelection(): number[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidSelection(parsed)) return parsed;
    }
  } catch {
    // ignore
  }

  const nums = pickUniqueNumbers(9, 1, PHOTO_COUNT);
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nums));
  } catch {
    // ignore
  }
  return nums;
}

export default function PhotoCarousel() {
  const [hovered, setHovered] = useState(false);

  // randomize once per session (first mount); persist via sessionStorage; no reshuffle on re-render
  const [photos] = useState(() => {
    const nums = loadOrCreateSelection();
    return nums.map((n) => ({
      id: `image_${n}`,
      // match app/photos/page.tsx casing: .JPG
      src: `${R2_BASE_URL}/image_${n}.JPG`,
      alt: `image_${n}`,
    }));
  });

  return (
    <section
      className="h-full w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative flex h-full w-full items-center justify-center bg-black">
        {/* inner square with buffer to pane edges */}
        <div className="relative aspect-square w-[88%] max-h-[88%] max-w-[88%]">
          {/* stacked photos */}
          <div className="relative h-full w-full">
            {photos.map((photo, i) => {
              const preset = BASE_LAYOUT[i % BASE_LAYOUT.length];

              const base = { x: 0, y: 0, rotate: preset.rotate };

              const jitter = hovered
                ? {
                    x: (i % 2 === 0 ? 1 : -1) * 10,
                    y: (i % 3 === 0 ? -1 : 1) * 9,
                    rotate:
                      preset.rotate + (i === 0 ? 5 : i % 2 === 0 ? 7 : -6),
                  }
                : base;

              return (
                <motion.div
                  key={photo.id}
                  className={[
                    "absolute aspect-square w-[44%] sm:w-[40%] md:w-[38%] lg:w-[36%]",
                    "overflow-hidden rounded-3xl", // rounded corners
                    "shadow-[0_22px_55px_rgba(0,0,0,0.72)]", // no border; softer/lusher
                  ].join(" ")}
                  style={{
                    top: `${preset.top}%`,
                    left: `${preset.left}%`,
                    zIndex: preset.z,
                  }}
                  initial={base}
                  animate={jitter}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 27,
                    mass: 0.85,
                  }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 55vw, (max-width: 1200px) 35vw, 28vw"
                    priority={i === 0}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* hover text overlay – forced above photos */}
          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 999 }}
            initial={{ opacity: 0, x: -24, filter: "blur(10px)" }}
            animate={
              hovered
                ? { opacity: 1, x: 0, filter: "blur(0px)" }
                : { opacity: 0, x: -24, filter: "blur(10px)" }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* soft vignette behind text to avoid "square gradient" look */}
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[11.5rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(0,0,0,0.78), rgba(0,0,0,0.0))",
                  filter: "blur(10px)",
                }}
              />
              <motion.span
                className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white"
                style={{
                  // softer + less defined than before
                  textShadow:
                    "0 10px 40px rgba(0,0,0,0.75), 0 2px 16px rgba(0,0,0,0.65)",
                }}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={
                  hovered
                    ? { clipPath: "inset(0 0 0 0)" }
                    : { clipPath: "inset(0 100% 0 0)" }
                }
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Check out my photos
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
