// components/Reveal.tsx  ← REPLACE (slower, paint-safe fade-up)
"use client";
import * as React from "react";

type Props = {
  children: React.ReactNode;
  delayMs?: number;   // stagger
  y?: number;         // initial lift px
  durationMs?: number;
};

export default function Reveal({ children, delayMs = 0, y = 10, durationMs = 900 }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const start = () => {
      el.style.transition =
        `opacity ${durationMs}ms cubic-bezier(0.2,0.8,0.2,1) ${delayMs}ms,` +
        ` transform ${durationMs}ms cubic-bezier(0.2,0.8,0.2,1) ${delayMs}ms`;
      void el.getBoundingClientRect(); // commit pre-state
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    };

    requestAnimationFrame(() => requestAnimationFrame(start));
  }, [delayMs, durationMs]);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: `translateY(${y}px)`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
