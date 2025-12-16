// components/ProjectsTeaser.tsx — DROP-IN REPLACEMENT
"use client";

import { motion, animate, useMotionValue, cubicBezier } from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const EASE_IN_FAST = cubicBezier(0.4, 0.0, 1.0, 1.0);
const EASE_OUT_FAST = cubicBezier(0.16, 1.0, 0.3, 1.0);

export default function ProjectsTeaser() {
  // numeric percent; consumed via CSS var
  const x = useMotionValue<number>(-102);
  const [animating, setAnimating] = useState(false);
  const hoveringRef = useRef(false);
  const exitingRef = useRef(false);
  const runningRef = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    x.set(-102);
  }, [x]);

  const stopAnim = () => {
    runningRef.current?.stop();
    runningRef.current = null;
  };

  const onEnter = () => {
    hoveringRef.current = true;
    if (exitingRef.current) {
      stopAnim();
      exitingRef.current = false;
    }
    setAnimating(true);
    runningRef.current = animate(x, 0, {
      duration: 0.85,
      ease: EASE_OUT_FAST,
      onComplete: () => {
        if (hoveringRef.current) setAnimating(false);
      },
    });
  };

  const onLeave = () => {
    hoveringRef.current = false;
    exitingRef.current = true;
    setAnimating(true);
    runningRef.current = animate(x, 102, {
      duration: 0.75,
      ease: EASE_IN_FAST,
      onComplete: () => {
        if (!hoveringRef.current) {
          x.set(-102);
          exitingRef.current = false;
          setAnimating(false);
        }
      },
    });
  };

  return (
    <section
      className="relative min-w-0 bg-black overflow-hidden rounded-3xl md:rounded-[2.5rem]"
      style={{ isolation: "isolate" }}
    >
      <Link
        href="/projects"
        aria-label="open projects"
        className="group relative block w-full select-none no-underline hover:no-underline focus:no-underline"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div
          className="relative z-0 py-10 md:py-12"
          style={{
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <h2 className="m-0 p-0 flex items-center gap-3 text-left text-[clamp(2rem,8vw,5.2rem)] font-medium tracking-tight text-white">
            <span>Projects</span>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="translate-y-[2px]"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M13 5l7 7-7 7" />
            </svg>
          </h2>
        </div>

        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 inset-x-0 z-10 rounded-3xl md:rounded-[2.5rem]"
          style={
            {
              background: "#fff",
              willChange: "transform",
              // bind MotionValue and provide SSR-safe fallback (-102)
              ["--tx" as any]: x,
              transform: "translateX(calc(var(--tx, -102) * 1%))",
            } as React.CSSProperties
          }
        >
          {animating && (
            <>
              <div
                className="absolute inset-y-0"
                style={{
                  right: "100%",
                  width: "56px",
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,1))",
                  pointerEvents: "none",
                }}
              />
              <div
                className="absolute inset-y-0"
                style={{
                  left: "100%",
                  width: "56px",
                  background:
                    "linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0))",
                  pointerEvents: "none",
                }}
              />
            </>
          )}

          <div className="h-full flex items-center">
            <div
              className="w-full"
              style={{
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <span className="inline-flex items-center gap-4 text-[clamp(2rem,8vw,5.2rem)] font-medium tracking-tight text-black">
                See my work
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="translate-y-[2px] ml-1"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="M13 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </section>
  );
}

