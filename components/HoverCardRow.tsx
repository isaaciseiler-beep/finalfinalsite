"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const EASE_DECEL: [number, number, number, number] = [0.05, 0.7, 0.12, 1];

export type HoverCardRowProps = {
  href: string;
  label: string;
  active: boolean;
  external?: boolean;
  open: boolean;
  badge?: string;
  title?: string;
  blurb?: string;
  onEnterInternal: () => void;
  onEnterExternal?: () => void;
  onLeaveAll: () => void; // kept for compatibility (not used here)
  reduceMotion: boolean;
};

export default function HoverCardRow({
  href,
  label,
  active,
  external,
  open,
  blurb,
  onEnterInternal,
  onEnterExternal,
  reduceMotion,
}: HoverCardRowProps) {
  const showCard = open && !external;

  // Fast + controlled (no rubbery bounce)
  const pillSpring = reduceMotion
    ? { duration: 0.01 }
    : { type: "spring" as const, stiffness: 900, damping: 70, mass: 0.55 };

  // Content expand/collapse: quick + smooth, no vertical “slide”
  const contentMs = reduceMotion ? 1 : 170;

  return (
    <motion.div
      layout
      transition={{ layout: pillSpring }}
      className="relative overflow-visible bg-black"
    >
      {/* White pill: shared layout element that moves & resizes instantly */}
      {showCard && (
        <motion.div
          layoutId="hovercard-bg"
          transition={pillSpring}
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
          style={{ willChange: "transform" }}
        />
      )}

      <Link
        href={href}
        // Optional perf tweak: prevents route prefetch work on hover from competing with animation.
        // If you like prefetching, remove this line.
        prefetch={false}
        className="group relative z-10 block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
        onPointerEnter={() => (external ? onEnterExternal?.() : onEnterInternal())}
        onFocus={() => (external ? onEnterExternal?.() : onEnterInternal())}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-expanded={open}
        style={{ textDecoration: "none" }}
      >
        {/* header row */}
        <div
          className={`flex items-center justify-between px-3 py-2 text-sm ${
            showCard
              ? "text-black"
              : active
                ? "text-white font-medium"
                : "text-fg hover:text-white"
          }`}
        >
          {external ? (
            <span
              className="relative font-normal underline-offset-4 group-hover:underline"
              style={{ textDecorationThickness: "1px" }}
            >
              {label}
            </span>
          ) : (
            <span className="relative font-normal">
              {label}
              <motion.span
                className="pointer-events-none absolute -bottom-[2px] left-0 h-px w-full bg-current"
                style={{ transformOrigin: "left" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: open || active ? 1 : 0 }}
                transition={
                  reduceMotion ? { duration: 0.01 } : { duration: 0.28, ease: EASE_DECEL }
                }
              />
            </span>
          )}

          {external && (
            <span className="ml-2 inline-flex items-center transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-4 w-4 opacity-80" aria-hidden />
            </span>
          )}
        </div>

        {/* expanded content (same form), smoother than height:auto */}
        <div
          className="grid overflow-hidden"
          style={{
            gridTemplateRows: showCard ? "1fr" : "0fr",
            opacity: showCard ? 1 : 0,
            transitionProperty: "grid-template-rows, opacity",
            transitionDuration: `${contentMs}ms, ${Math.max(90, contentMs - 50)}ms`,
            transitionTimingFunction: `cubic-bezier(${EASE_DECEL.join(",")}), linear`,
          }}
          aria-hidden={!showCard}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-0.5">
              <div className="line-clamp-2 text-xs leading-relaxed text-black/80">
                {blurb}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
