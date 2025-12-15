"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Modal that only covers the content pane (not the fixed sidebar/brand).
 * Sidebar + brand are higher z-index layers and are never blurred/darkened.
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

  const overlayTransition = reduce ? { duration: 0 } : { duration: 0.15, ease: "easeOut" };
  const panelTransition = reduce
    ? { duration: 0 }
    : ({ duration: 0.22, ease: [0.4, 0.0, 0.2, 1] } as any);

  return (
    // z-[40] sits under Sidebar (z-[50]) and Brand (z-[60])
    <div className="fixed inset-0 z-[40]" style={{ left: "var(--sidebar-offset)" } as any}>
      {/* overlay: dark + slight blur behind the popup */}
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={overlayTransition}
        onClick={() => router.back()}
      />

      {/* centered panel within the content pane */}
      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.985 }}
          transition={panelTransition}
          className="relative w-full overflow-hidden rounded-t-3xl border border-white/10 bg-card shadow-[0_0_40px_rgba(0,0,0,0.55)] sm:max-w-2xl sm:rounded-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => router.back()}
            className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-background/70 text-sm text-foreground backdrop-blur transition hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            ✕
          </button>

          <div className="max-h-[85vh] overflow-y-auto [overscroll-behavior:contain] sm:max-h-[90vh]">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
