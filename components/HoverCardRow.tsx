// components/HoverCardRow.tsx  ← REPLACE
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
  onLeaveAll: () => void;
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
  onLeaveAll,
  reduceMotion,
}: HoverCardRowProps) {
  const showCard = open && !external;

  return (
    <motion.div
      className="relative overflow-visible bg-black"
      onMouseEnter={() => (external ? undefined : onEnterInternal())}
      onMouseLeave={onLeaveAll}
    >
      {/* white rounded background on hover/open */}
      <AnimatePresence initial={false}>
        {showCard && (
          <motion.div
            layoutId="hovercard-bg"
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={
              reduceMotion ? { duration: 0.16 } : { duration: 0.32, ease: EASE_DECEL }
            }
          />
        )}
      </AnimatePresence>

      <Link
        href={href}
        className="group relative z-10 block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
        onMouseEnter={() => (external ? onEnterExternal?.() : onEnterInternal())}
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
          style={{ textDecoration: "none" }}
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
                  reduceMotion ? { duration: 0.1 } : { duration: 0.45, ease: EASE_DECEL }
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

        {/* expanded content: two lines + buffer, no media slot */}
        <AnimatePresence initial={false}>
          {showCard && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                reduceMotion ? { duration: 0.14 } : { duration: 0.3, ease: EASE_DECEL }
              }
              className="relative overflow-hidden"
            >
              <div className="px-3 pb-3 pt-0.5">
                <div className="line-clamp-2 text-xs leading-relaxed text-black/80">
                  {blurb}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}

