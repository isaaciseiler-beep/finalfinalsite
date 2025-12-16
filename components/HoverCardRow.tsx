// components/HoverCardRow.tsx
// Smoother hover behavior:
// - No expanding/collapsing row height (prevents the list from "sliding" around)
// - Shared layout highlight + shared layout preview panel that glides between items
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// slightly slower ease-out tail
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
  // kept for API-compatibility with your Sidebar (not needed with the new hover logic)
  onLeaveAll: () => void;
  reduceMotion: boolean;
};

export default function HoverCardRow({
  href,
  label,
  active,
  external,
  open,
  badge,
  title,
  blurb,
  onEnterInternal,
  onEnterExternal,
  reduceMotion,
}: HoverCardRowProps) {
  const show = open && !external;

  const layoutTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.36, ease: EASE_DECEL };

  const previewTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.28, ease: EASE_DECEL };

  return (
    <motion.div
      className="relative overflow-visible bg-black"
      onPointerEnter={() => (external ? onEnterExternal?.() : onEnterInternal())}
    >
      {/* shared white rounded highlight that glides between rows */}
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            layoutId="sidebar-hover-bg"
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={layoutTransition}
          />
        )}
      </AnimatePresence>

      <Link
        href={href}
        className="group relative z-10 block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
        onFocus={() => (external ? onEnterExternal?.() : onEnterInternal())}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-expanded={open}
        style={{ textDecoration: "none" }}
      >
        <div
          className={
            "flex items-center justify-between px-3 py-2 text-sm transition-colors duration-200 " +
            (show
              ? "text-black"
              : active
                ? "text-white font-medium"
                : "text-fg hover:text-white")
          }
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
                  reduceMotion
                    ? { duration: 0.1 }
                    : { duration: 0.45, ease: EASE_DECEL }
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
      </Link>

      {/* shared preview card (does NOT affect row height; prevents list reflow) */}
      <AnimatePresence initial={false}>
        {show && (title || blurb || badge) && (
          <motion.div
            layoutId="sidebar-hover-preview"
            className="absolute left-full top-1/2 z-20 ml-3 w-[220px] -translate-y-1/2 rounded-2xl bg-white p-3 text-black shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, filter: "blur(2px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(2px)", scale: 0.98 }}
            transition={previewTransition}
          >
            {(badge || title) && (
              <div className="mb-1">
                {badge && (
                  <div className="text-[10px] font-medium uppercase tracking-wide text-black/50">
                    {badge}
                  </div>
                )}
                {title && (
                  <div className="text-sm font-medium leading-snug">{title}</div>
                )}
              </div>
            )}

            {blurb && (
              <div className="text-xs leading-relaxed text-black/70">{blurb}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
