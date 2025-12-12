// components/HoverCardRow.tsx  ← REPLACE
"use client";
import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const EASE_DECEL: [number, number, number, number] = [0.05, 0.7, 0.2, 1];
// adjust if you want a touch more presence without showing gray
const OVERLAY_OPACITY = 0.045; // 4.5% screen-blend sheen on black

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
  badge,
  title,
  blurb,
  onEnterInternal,
  onEnterExternal,
  onLeaveAll,
  reduceMotion,
}: HoverCardRowProps) {
  return (
    <motion.div
      className="relative overflow-visible bg-black"
      onMouseEnter={() => (external ? undefined : onEnterInternal())}
      onMouseLeave={onLeaveAll}
    >
      {/* unified card background (pure black) with a subtle screen-blend sheen */}
      <AnimatePresence initial={false}>
        {open && !external && (
          <motion.div
            layoutId="hovercard-bg"
            className="absolute left-[-4px] right-[-4px] top-0 z-0 rounded-2xl bg-black"
            initial={{ opacity: 0, height: 44 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 44 }}
            transition={reduceMotion ? { duration: 0.16 } : { duration: 0.32, ease: EASE_DECEL }}
          >
            {/* sheen layer: brightens black just enough without introducing gray or lines */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              style={{
                background:
                  "radial-gradient(120% 140% at 10% 10%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.04) 28%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0) 75%)",
                opacity: OVERLAY_OPACITY,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* one clickable link that includes header + expanded content */}
      <Link
        href={href}
        className="relative z-10 block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
        style={{ textDecoration: "none" }}
        onMouseEnter={() => (external ? onEnterExternal?.() : onEnterInternal())}
        onFocus={() => (external ? onEnterExternal?.() : onEnterInternal())}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-expanded={open}
      >
        {/* header row with single animated underline */}
        <div
          className={`flex items-center justify-between px-3 py-2 text-sm ${
            active ? "text-white font-medium" : "text-fg hover:text-white"
          }`}
          style={{ textDecoration: "none" }}
        >
          <span className="relative font-normal" style={{ textDecoration: "none" }}>
            {label}
            <motion.span
              className="pointer-events-none absolute -bottom-[2px] left-0 h-px w-full bg-current"
              style={{ transformOrigin: "left" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: open || active ? 1 : 0 }}
              transition={reduceMotion ? { duration: 0.1 } : { duration: 0.45, ease: EASE_DECEL }}
            />
          </span>
          {external && <ArrowUpRight className="h-4 w-4 opacity-80" aria-hidden />}
        </div>

        {/* expanded, fully clickable content */}
        <AnimatePresence initial={false}>
          {open && !external && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduceMotion ? { duration: 0.14 } : { duration: 0.3, ease: EASE_DECEL }}
              className="relative overflow-visible"
              style={{ textDecoration: "none" }}
            >
              <div className="px-3 pb-3 pt-1" style={{ textDecoration: "none" }}>
                <div className="grid grid-cols-[80px_1fr] items-stretch gap-2">
                  {/* media slot fills fully; replace with <Image fill .../> to show real media */}
                  <div className="relative">
                    <div className="h-full w-full rounded-xl bg-black" />
                  </div>
                  <div className="min-w-0" style={{ textDecoration: "none" }}>
                    <div className="text-[11px] text-neutral-300" style={{ textDecoration: "none" }}>
                      {badge}
                    </div>
                    <div className="mt-0.5 text-sm text-neutral-100" style={{ textDecoration: "none" }}>
                      {title ?? "section"}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-neutral-300" style={{ textDecoration: "none" }}>
                      {blurb ?? "concise overview and a visual teaser live here."}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  );
}
