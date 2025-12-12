// components/Parallax.tsx — NEW DROP-IN
"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { PropsWithChildren, useRef } from "react";

type Props = PropsWithChildren<{
  /** vertical shift in px from top→bottom of viewport; negative moves up */
  amount?: number;
  /** optional className forwarded to wrapper */
  className?: string;
  /** optional style forwarded to wrapper */
  style?: React.CSSProperties;
}>;

/**
 * Wrap any block to give it a subtle vertical parallax tied to the viewport.
 * Works on every page; respects prefers-reduced-motion.
 */
export default function Parallax({ amount = -80, className, style, children }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();

  // progress as the element moves through the viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // always create transform (hooks must not be conditional)
  const y = useTransform(scrollYProgress, [0, 1], [0, amount]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...(style || {}),
        y: (reduce ? 0 : y) as any,
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}
