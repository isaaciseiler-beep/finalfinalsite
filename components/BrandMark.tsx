// components/BrandMark.tsx — DROP-IN REPLACEMENT (same look, less bounce)
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export const BRAND_SPRING = { type: "spring", stiffness: 180, damping: 30 };
const THRESHOLD_PX = 80;

function useMidScrollCollapse(thresholdPx = THRESHOLD_PX) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.scrollY > thresholdPx;
  });

  useEffect(() => {
    const y = typeof window !== "undefined" ? window.scrollY : 0;
    setCollapsed(y > thresholdPx);
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
        <span ref={fullRef} className="invisible absolute left-0 top-0" aria-hidden>
          Isaac Seiler
        </span>
        <span ref={shortRef} className="invisible absolute left-0 top-0" aria-hidden>
          IIS
        </span>

        <motion.span
          className="absolute left-0 top-0"
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -6 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ pointerEvents: "none" }}
        >
          Isaac Seiler
        </motion.span>

        <motion.span
          className="absolute left-0 top-0"
          initial={false}
          animate={{ opacity: collapsed ? 1 : 0, x: collapsed ? 0 : -6 }}
          transition={{ duration: 0.2 }}
          style={{ pointerEvents: "none" }}
        >
          IIS
        </motion.span>
      </span>
    </motion.span>
  );
}

