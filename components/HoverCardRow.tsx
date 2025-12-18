"use client";
import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// iOS-ish: smooth, no bounce
const EASE_IOS: [number, number, number, number] = [0.2, 0.0, 0.0, 1.0];

export type HoverCardRowProps = {
  href: string;
  label: string;
  active: boolean;
  external?: boolean;
  open: boolean;

  // A single shared “pill” highlight that morphs between rows.
  // Kept separate from `open` so we can fade it out cleanly after hover ends.
  pill: boolean;
  pillVisible: boolean;

  badge?: string;
  title?: string;
  blurb?: string;

  onEnterInternal: () => void;
  onEnterExternal?: () => void;
  onLeaveAll: () => void; // kept for compatibility (sidebar handles leave)
  reduceMotion: boolean;
};

export default function HoverCardRow({
  href,
  label,
  active,
  external,
  open,
  pill,
  pillVisible,
  blurb,
  onEnterInternal,
  onEnterExternal,
  onLeaveAll,
  reduceMotion,
}: HoverCardRowProps) {
  // Compatibility: sidebar handles leave (stable bounds).
  void onLeaveAll;

  const highlighted = open;
  const showPreview = highlighted && !external;

  const layoutTransition = reduceMotion
    ? { layout: { duration: 0 } }
    : { layout: { type: "tween", duration: 0.26, ease: EASE_IOS } };

  const pillTransition = reduceMotion
    ? { duration: 0 }
    : {
        type: "tween" as const,
        duration: 0.26,
        ease: EASE_IOS,
        opacity: { duration: 0.16, ease: "linear" as const },
      };

  return (
    <motion.div className="relative overflow-visible" layout="position" transition={layoutTransition}>
      {/* Shared hover pill (morphs between rows, no blips) */}
      {pill && (
        <motion.div
          layoutId="sidebar-pill"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl border border-white/10 bg-neutral-900/85 shadow-[0_16px_32px_rgba(0,0,0,0.55)]"
          initial={false}
          animate={{ opacity: pillVisible ? 1 : 0 }}
          transition={pillTransition}
        />
      )}

      <Link
        href={href}
        prefetch={false}
        className="group relative z-10 block rounded-2xl outline-none no-underline hover:no-underline focus:no-underline focus-visible:ring-2 focus-visible:ring-neutral-700"
        onPointerEnter={() => (external ? onEnterExternal?.() : onEnterInternal())}
        onFocus={() => (external ? onEnterExternal?.() : onEnterInternal())}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-expanded={open}
        style={{ textDecoration: "none" }}
      >
        {/* header row */}
        <div
          className={`flex items-center justify-between px-3 py-2 text-sm transition-colors duration-200 ${
            highlighted ? "text-white" : active ? "text-white font-medium" : "text-fg hover:text-white"
          }`}
          style={{ textDecoration: "none" }}
        >
          <span className="relative font-normal">{label}</span>

          {external && (
            <span className="ml-2 inline-flex items-center transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
              <ArrowUpRight className="h-4 w-4 opacity-80" aria-hidden />
            </span>
          )}
        </div>

        {/* expanded content (internal only) */}
        <AnimatePresence initial={false}>
          {showPreview && (
            <motion.div
              key="preview"
              layout
              initial={reduceMotion ? { opacity: 1, height: "auto" } : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "tween", duration: 0.22, ease: EASE_IOS }}
              className="relative overflow-hidden"
            >
              <div className="px-3 pb-3 pt-0.5">
                <div className="line-clamp-2 text-xs leading-relaxed text-white/75">{blurb}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}
