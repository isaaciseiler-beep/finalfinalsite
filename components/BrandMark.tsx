// components/BrandMark.tsx  ← DROP-IN REPLACEMENT
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export const BRAND_SPRING = { type: "spring", stiffness: 180, damping: 30 };
const THRESHOLD_PX = 80;

function useMidScrollCollapse(thresholdPx = THRESHOLD_PX) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    setCollapsed(y > thresholdPx);
    if (y <= thresholdPx) setCollapsed(false);
  }, [pathname, thresholdPx]);

  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > thresholdPx);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [thresholdPx]);

  return collapsed;
}

function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
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

  // measure both states to drive a pure width animation (left-anchored)
  const { ref: fullRef, width: fullW } = useMeasuredWidth<HTMLSpanElement>();
  const { ref: shortRef, width: shortW } = useMeasuredWidth<HTMLSpanElement>();

  const fullWidth = fullW ?? 320;
  const miniWidth = shortW ?? 66;

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
      layout // participate in shared layout animation
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
        <AnimatePresence initial={false} mode="wait">
          {!collapsed && (
            <motion.span
              key="full"
              className="absolute left-0 top-0"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.28 }}
            >
              Isaac Seiler
            </motion.span>
          )}
        </AnimatePresence>

        {/* collapsed monogram */}
        <AnimatePresence initial={false} mode="wait">
          {collapsed && (
            <motion.span
              key="mini"
              className="absolute left-0 top-0"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.24 }}
            >
              IIS
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.span>
  );
}
