"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const FALLBACK_TOP = 120; // if tabs can't be measured
const MAX_ALIGN_TOP = 260; // only trust measurements within a reasonable band

/**
 * fixed pane modal:
 * - backdrop covers only the content pane (offset by --sidebar-offset)
 * - pane is fixed, with internal scroll (pane does not move)
 * - pane vertically aligns to the filter tabs and ends above the footer
 */
export default function Modal({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // pane top aligned to the filter tabs row
  const [paneTop, setPaneTop] = useState<number>(FALLBACK_TOP);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };

    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [router]);

  useLayoutEffect(() => {
    const measure = () => {
      const el = document.getElementById("projects-filter-tabs");
      if (!el) {
        setPaneTop(FALLBACK_TOP);
        return;
      }

      const top = Math.round(el.getBoundingClientRect().top);

      // if the tabs are offscreen (or weird), keep a sane fixed top
      if (top < 24 || top > MAX_ALIGN_TOP) {
        setPaneTop(FALLBACK_TOP);
        return;
      }

      setPaneTop(top);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const overlayTransition = reduce ? { duration: 0 } : { duration: 0.14, ease: "easeOut" };
  const paneTransition = reduce
    ? { duration: 0 }
    : ({ duration: 0.18, ease: [0.4, 0.0, 0.2, 1] } as any);

  return (
    // z-[40] stays under Sidebar (z-[50]) and Brand (z-[60])
    <div className="fixed inset-0 z-[40]" style={{ left: "var(--sidebar-offset)" } as any}>
      {/* backdrop: lightly shaded + blurred (content pane only) */}
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 h-full w-full bg-black/35 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={overlayTransition}
        onClick={() => router.back()}
      />

      {/* pane wrapper aligned to page padding */}
      <div className="absolute inset-0 px-4 sm:px-6">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.992 }}
          transition={paneTransition}
          // fixed-height pane: top aligned to tabs, bottom sits above footer
          style={{
            top: paneTop,
            bottom: "calc(var(--footer-h, 0px) + 18px)",
          }}
          className={[
            "absolute left-0 right-0 mx-auto w-full max-w-[980px]",
            "overflow-hidden rounded-3xl border border-white/10 bg-card",
            "shadow-[0_0_40px_rgba(0,0,0,0.55)]",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* x stays fixed while content scrolls */}
          <button
            ref={closeRef}
            type="button"
            onClick={() => router.back()}
            className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-background/70 text-sm text-foreground backdrop-blur transition hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            ✕
          </button>

          {/* scroll only inside the pane */}
          <div className="h-full overflow-y-auto [overscroll-behavior:contain]">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
