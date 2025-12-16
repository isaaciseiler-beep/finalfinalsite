// components/Footer.tsx
"use client";

import { useEffect, useRef } from "react";
import GitWidget from "@/components/GitWidget";

export default function Footer() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const setVar = () =>
      document.documentElement.style.setProperty("--footer-h", `${el.offsetHeight}px`);
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <footer ref={ref} className="relative z-[60] w-full bg-black" style={{ marginTop: 0 }}>
      <div className="w-full px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center justify-between gap-4">
          <div className="shrink-0">
            <GitWidget repoUrl="https://github.com/isaaciseiler-beep/finalfinalsite/tree/main" />
          </div>

          <p className="shrink-0 text-sm text-white/80">
            © {new Date().getFullYear()} Isaac Seiler
          </p>
        </div>
      </div>
    </footer>
  );
}
