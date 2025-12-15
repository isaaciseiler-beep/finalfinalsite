"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowLeft, Menu } from "lucide-react";
import BrandMark from "./BrandMark";
import { useSidebar } from "./SidebarContext";

type BootPhase = "boot" | "animating" | "done";

const EASE_OUT = [0.2, 1, 0.2, 1] as const;

// 50% bigger
const LOGO_SCALE = 1.5;

// Tailwind equivalents: pl-6 (1.5rem), pt-8 (2rem) computed at runtime
const FINAL_LEFT_REM = 1.5;
const FINAL_TOP_REM = 2;

// Quick + smooth (no “layout” measurement glitches)
const MOVE_MS = 260;

export default function Brand() {
  const { open, setOpen } = useSidebar();

  const [phase, setPhase] = useState<BootPhase>("boot");
  const booting = phase !== "done";

  // We position the whole brand row via x/y transforms (smoother than layout FLIP here)
  const rowRef = useRef<HTMLDivElement>(null);
  const [bootPos, setBootPos] = useState<{ x: number; y: number } | null>(null);
  const [finalPos, setFinalPos] = useState<{ x: number; y: number } | null>(null);

  // Controls the left->right “fill” reveal
  const fillControls = useAnimationControls();

  // Prevent scroll during boot/transition.
  useEffect(() => {
    if (!booting) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [booting]);

  // Compute:
  // 1) exact centered position for the *actual rendered size* (including LOGO_SCALE)
  // 2) final resting position above sidebar based on rem
  useLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const computeFinal = () => {
      const rem =
        typeof window !== "undefined"
          ? parseFloat(getComputedStyle(document.documentElement).fontSize || "16") || 16
          : 16;

      setFinalPos({ x: rem * FINAL_LEFT_REM, y: rem * FINAL_TOP_REM });
    };

    const computeCenter = () => {
      const rect = el.getBoundingClientRect();
      setBootPos({
        x: Math.round((window.innerWidth - rect.width) / 2),
        y: Math.round((window.innerHeight - rect.height) / 2),
      });
    };

    computeFinal();
    computeCenter();

    // Keep it perfectly centered if anything changes size during boot (font swap, etc.)
    const ro = new ResizeObserver(() => {
      if (phase === "boot") computeCenter();
    });
    ro.observe(el);

    const onResize = () => {
      computeFinal();
      if (phase === "boot") computeCenter();
    };
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [phase]);

  // Start the fill immediately (fast), but stop short so it reads as "loading".
  useEffect(() => {
    fillControls.start({
      width: "85%",
      transition: { duration: 0.55, ease: EASE_OUT },
    });
  }, [fillControls]);

  // Gate: when the app is ready, finish the fill, then move to the sidebar position.
  useEffect(() => {
    let cancelled = false;

    const MIN_BOOT_MS = 220;
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const loadReady =
      typeof document !== "undefined" && document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true })
          );

    const fontsReady =
      typeof document !== "undefined" && (document as any).fonts?.ready
        ? (document as any).fonts.ready.catch(() => undefined)
        : Promise.resolve();

    (async () => {
      try {
        await Promise.all([loadReady, fontsReady]);

        const elapsed =
          (typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt;

        if (elapsed < MIN_BOOT_MS) await sleep(MIN_BOOT_MS - elapsed);

        // Finish fill (quick snap to 100%)
        await fillControls.start({
          width: "100%",
          transition: { duration: 0.18, ease: EASE_OUT },
        });

        // One frame to avoid any last-moment jitter
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      } finally {
        if (!cancelled) setPhase("animating");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fillControls]);

  const target =
    phase === "boot"
      ? bootPos ?? { x: 0, y: 0 }
      : finalPos ?? { x: 0, y: 0 };

  const moveTransition =
    phase === "boot"
      ? { duration: 0 } // no “slide-in from top-left” while measuring
      : { duration: MOVE_MS / 1000, ease: EASE_OUT };

  return (
    <div
      className={[
        "fixed inset-0 select-none pointer-events-none",
        booting ? "z-[999]" : "z-[60]",
      ].join(" ")}
    >
      {/* Boot black screen: fades out during the move for a seamless reveal */}
      <AnimatePresence>
        {booting && (
          <motion.div
            key="boot-black"
            className="fixed inset-0 bg-black pointer-events-auto"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "boot" ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          />
        )}
      </AnimatePresence>

      {/* Brand row (positioned by transforms, not layout) */}
      <motion.div
        ref={rowRef}
        className="fixed left-0 top-0 pointer-events-auto z-10"
        style={{
          scale: LOGO_SCALE,
          transformOrigin: "top left",
          willChange: "transform",
        }}
        animate={{
          x: target.x,
          y: target.y,
          opacity: bootPos && finalPos ? 1 : 0, // hide until we know exact center + final pos
        }}
        transition={moveTransition}
        onAnimationComplete={() => {
          if (phase === "animating") setPhase("done");
        }}
      >
        <div className="inline-flex items-center flex-nowrap whitespace-nowrap gap-3">
          <Link
            href="/"
            aria-label="go home"
            className="inline-flex items-center focus:outline-none no-underline hover:no-underline shrink-0"
          >
            {/* Left->right fill: dim base + white overlay clipped by animated width */}
            <span className="relative inline-block">
              <span className="opacity-25">
                <BrandMark />
              </span>

              <motion.span
                className="absolute inset-y-0 left-0 overflow-hidden"
                initial={{ width: "0%" }}
                animate={fillControls}
                style={{ willChange: "width" }}
              >
                <BrandMark />
              </motion.span>
            </span>
          </Link>

          {/* Controls only after boot */}
          {phase === "done" && (
            <button
              aria-label={open ? "close navigation" : "open navigation"}
              onClick={() => setOpen(!open)}
              className="p-2 transition hover:opacity-80 focus:outline-none shrink-0"
            >
              {open ? <ArrowLeft size={16} /> : <Menu size={16} />}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
