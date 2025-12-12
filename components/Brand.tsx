"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowLeft, Menu } from "lucide-react";
import BrandMark, { BRAND_SPRING } from "./BrandMark";
import { useSidebar } from "./SidebarContext";

type BootPhase = "boot" | "animating" | "done";

const EASE_OUT = [0.2, 1, 0.2, 1] as const; // fast start, slow end

export default function Brand() {
  const { open, setOpen } = useSidebar();

  // boot overlay + logo flight only on first mount (RootLayout persists across nav)
  const [phase, setPhase] = useState<BootPhase>("boot");
  const booting = phase !== "done";

  // Prevent scroll during the boot screen.
  useEffect(() => {
    if (!booting) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [booting]);

  // Advance from boot -> animating once the app is "ready" to reveal.
  useEffect(() => {
    let cancelled = false;

    const MIN_BOOT_MS = 300;
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

        // Let layout settle so the layout animation measures correctly.
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      } finally {
        if (!cancelled) setPhase("animating");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={[
        // Full-viewport alignment layer (lets the logo move via layout changes)
        "fixed inset-0 select-none",
        // During boot we must cover everything (sidebar + page) with black
        booting ? "z-[999]" : "z-[60]",
        // Center on boot; match old resting position via padding when done
        phase === "boot"
          ? "flex items-center justify-center"
          : "flex items-start justify-start pt-8 pl-6",
        // Don't block the app after boot; only the brand row should be interactive
        "pointer-events-none",
      ].join(" ")}
    >
      {/* Boot black screen layer (hides all other content + sidebar) */}
      <AnimatePresence>
        {booting && (
          <motion.div
            key="boot-black"
            className="fixed inset-0 bg-black pointer-events-auto"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
          />
        )}
      </AnimatePresence>

      {/* Brand row (the SAME logo element; no duplication) */}
      <motion.div
        className="relative z-10 pointer-events-auto"
        layout
        animate={{ scale: phase === "boot" ? 1.35 : 1 }}
        transition={{
          layout: { duration: 0.72, ease: EASE_OUT },
          scale: { duration: 0.72, ease: EASE_OUT },
        }}
        onLayoutAnimationComplete={() => {
          if (phase === "animating") setPhase("done");
        }}
      >
        <LayoutGroup id="brand-row">
          <motion.div className="inline-flex flex-col items-center gap-4" layout>
            {/* non-wrapping row; arrow position animates with same spring */}
            <motion.div
              className="inline-flex items-center flex-nowrap whitespace-nowrap gap-3"
              layout
              transition={BRAND_SPRING}
            >
              <Link
                href="/"
                aria-label="go home"
                className="inline-flex items-center focus:outline-none no-underline hover:no-underline shrink-0"
              >
                <BrandMark />
              </Link>

              {/* Hide all controls during boot; reveal once ready */}
              {phase === "done" && (
                <motion.button
                  aria-label={open ? "close navigation" : "open navigation"}
                  onClick={() => setOpen(!open)}
                  className="p-2 transition hover:opacity-80 focus:outline-none shrink-0"
                  layout="position"
                  transition={BRAND_SPRING}
                >
                  {open ? <ArrowLeft size={16} /> : <Menu size={16} />}
                </motion.button>
              )}
            </motion.div>

            {/* Circular progress indicator (directly below logo) */}
            <AnimatePresence>
              {phase === "boot" && (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  aria-label="Loading"
                >
                  <div className="h-5 w-5 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
