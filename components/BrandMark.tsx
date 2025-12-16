// components/BrandMark.tsx — DROP-IN REPLACEMENT (same look, less lag)
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// Slightly snappier so the toggle button "tracks" the logo width sooner.
export const BRAND_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 0.7,
} as const;

const THRESHOLD_PX = 80;

function useMidScrollCollapse(thresholdPx = THRESHOLD_PX) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > thresholdPx;
  });

  // Re-evaluate on route changes (keeps behavior consistent across pages).
  useEffect(() => {
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    setCollapsed(y > thresholdPx);
  }, [pathname, thresholdPx]);

  // Only update state when the boolean actually flips (reduces scroll work).
  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > thresholdPx;
      setCollapsed((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [thresholdPx]);

  return collapsed;
}

function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setW(el.getBoundingClientRect().width);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width: w };
}

export default function BrandMark() {
  const collapsed = useMidScrollCollapse();

  const { ref: fullRef, width: fullW } = useMeasuredWidth<HTMLSpanElement>();
  const { ref: shortRef, width: shortW } = useMeasuredWidth<HTMLSpanElement>();

  const fullWidth = useMemo(() => fullW ?? 320, [fullW]);
  const miniWidth = useMemo(() => shortW ?? 66, [shortW]);

  return (
    <motion.span
      aria-label="site logo"
      className={[
        "inline-block select-none whitespace-nowrap shrink-0",
        "font-normal tracking-tighter leading-[1.1]",
        "text-[2.75rem] sm:text-[2.95rem] text-current",
      ].join(" ")}
      style={{ transformOrigin: "left center" }}
      initial={false}
      animate={{ width: collapsed ? miniWidth : fullWidth }}
      transition={{ width: BRAND_SPRING }}
    >
      <span className="relative block h-[1.1em]">
        {/* invisible measurers */}
        <span ref={fullRef} className="invisible absolute left-0 top-0" aria-hidden>
          Isaac Seiler
        </span>
        <span ref={shortRef} className="invisible absolute left-0 top-0" aria-hidden>
          IIS
        </span>

        {/* full wordmark */}
        <motion.span
          className="absolute left-0 top-0"
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -6 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ pointerEvents: "none" }}
        >
          Isaac Seiler
        </motion.span>

        {/* collapsed monogram */}
        <motion.span
          className="absolute left-0 top-0"
          initial={false}
          animate={{ opacity: collapsed ? 1 : 0, x: collapsed ? 0 : -6 }}
          transition={{ duration: 0.16 }}
          style={{ pointerEvents: "none" }}
        >
          IIS
        </motion.span>
      </span>
    </motion.span>
  );
}
