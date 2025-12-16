"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// ios-ish (intentional, no bounce)
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
  reduceMotion,
}: HoverCardRowProps) {
  const showCard = open && !external;

  // slightly slower + more intentional than before
  const dur = reduceMotion ? 0 : 0.26;

  // 2-line blurb container ceiling (stable)
  const MAX_PREVIEW_H = 84;

  return (
    <div ref={rowRef} className="relative z-10 overflow-visible bg-black">
      <Link
        href={href}
        prefetch={false}
        className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-700"
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
                    : { type: "tween", duration: 0.30, ease: EASE_IOS }
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

        {/* expanded content (same form), slower + steadier */}
        <div
          className="overflow-hidden"
          style={{
            maxHeight: showCard ? MAX_PREVIEW_H : 0,
            opacity: showCard ? 1 : 0,
            transition: reduceMotion
              ? "none"
              : `max-height ${Math.round(dur * 1000)}ms cubic-bezier(${EASE_IOS.join(",")}), opacity 180ms linear`,
          }}
          aria-hidden={!showCard}
        >
          <div className="px-3 pb-3 pt-0.5">
            <div className="line-clamp-2 text-xs leading-relaxed text-black/80">
              {blurb}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
