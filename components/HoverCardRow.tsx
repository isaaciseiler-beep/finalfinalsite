"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// iOS-ish: smooth, no bounce
const EASE_IOS: [number, number, number, number] = [0.2, 0.0, 0.0, 1.0];

export type HoverCardRowProps = {
  rowRef?: React.RefCallback<HTMLDivElement>;
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
  onLeaveAll: () => void; // kept for compatibility (sidebar handles leave)
  reduceMotion: boolean;
};

export default function HoverCardRow({
  rowRef,
  href,
  label,
  active,
  external,
  open,
  blurb,
  onEnterInternal,
  onEnterExternal,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLeaveAll,
  reduceMotion,
}: HoverCardRowProps) {
  const showCard = open && !external;

  const setRowRef = React.useCallback<React.RefCallback<HTMLDivElement>>(
    (el) => {
      rowRef?.(el);
    },
    [rowRef]
  );

  // One shared highlight element that morphs between rows (no separate “pill layer” to misalign)
  const pillTransition = reduceMotion
    ? { layout: { duration: 0 }, opacity: { duration: 0 } }
    : {
        layout: { type: "tween", duration: 0.26, ease: EASE_IOS },
        opacity: { duration: 0.12, ease: "linear" as const },
      };

  return (
    <motion.div
      ref={setRowRef}
      className="relative overflow-visible"
      layout="position"
      transition={
        reduceMotion
          ? { layout: { duration: 0 } }
          : { layout: { type: "tween", duration: 0.26, ease: EASE_IOS } }
      }
    >
      {/* White rounded background that follows the hovered row (shared layout). */}
      <AnimatePresence initial={false}>
        {showCard && (
          <motion.div
            layoutId="sidebar-pill"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={pillTransition}
          />
        )}
      </AnimatePresence>

      <Link
        href={href}
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
                initial={false}
                animate={{ scaleX: open || active ? 1 : 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "tween", duration: 0.3, ease: EASE_IOS }
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

        {/* expanded content: measured height animation (no max-height artifacts) */}
        <AnimatePresence initial={false}>
          {showCard && (
            <motion.div
              key="preview"
              className="overflow-hidden"
              initial={reduceMotion ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "tween", duration: 0.22, ease: EASE_IOS }
              }
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
