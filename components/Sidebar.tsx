"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
  useMotionValue,
  animate,
} from "framer-motion";
import { useSidebar } from "./SidebarContext";
import HoverCardRow from "./HoverCardRow";

type NavItem = { href: string; label: string; external?: boolean };

const nav: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/photos", label: "Photos" },
  { href: "/contact", label: "Contact" },
  // ✅ removed Blog
  {
    href: "https://www.linkedin.com/in/isaacseiler/",
    label: "LinkedIn",
    external: true,
  },
];

const PREVIEW: Record<string, { badge: string; title: string; blurb: string }> = {
  "/about": { badge: "profile", title: "about me", blurb: "A little about me and what I do" },
  "/projects": { badge: "work", title: "projects", blurb: "Some of the work I’m most proud of" },
  "/experience": { badge: "resume", title: "experience", blurb: "Stuff I’ve done and places I’ve worked" },
  "/photos": { badge: "gallery", title: "photos", blurb: "Pictures I love of places I love" },
  "/contact": { badge: "reach out", title: "contact", blurb: "Get in touch and let’s connect" },
};

// menu slide ease
const EASE_DECEL: [number, number, number, number] = [0.05, 0.7, 0.12, 1];

// how many row-heights to skip before first menu item
const TOP_OFFSET_ROWS = 3;

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const reduce = !!useReducedMotion();

  const [hoverHref, setHoverHref] = React.useState<string | null>(null);
  const [rowSpacer, setRowSpacer] = React.useState<number>(0);

  // refs for measurement
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const rowRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  // single pill (ios-like): track target rect each frame, smooth without overshoot
  const pillTop = useMotionValue(0);
  const pillH = useMotionValue(0);
  const pillO = useMotionValue(0);

  const rafRef = React.useRef<number | null>(null);
  const activeHrefRef = React.useRef<string | null>(null);

  const stopTrack = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const measureActive = (): { top: number; height: number } | null => {
    const href = activeHrefRef.current;
    if (!href) return null;
    const row = rowRefs.current[href];
    const list = listRef.current;
    if (!row || !list) return null;

    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();

    // relative to list container
    let top = Math.round(rowRect.top - listRect.top);
    let height = Math.round(rowRect.height);

    // clamp to container (prevents “almost touching the top” / out-of-bounds flashes)
    const maxTop = Math.max(0, Math.round(listRect.height - height));
    top = Math.max(0, Math.min(top, maxTop));
    height = Math.max(0, Math.min(height, Math.round(listRect.height)));

    return { top, height };
  };

  const track = () => {
    const t = measureActive();
    if (!t) {
      stopTrack();
      return;
    }

    const curTop = pillTop.get();
    const curH = pillH.get();

    const dy = t.top - curTop;
    const dh = t.height - curH;

    // non-bouncy smoothing:
    // - moving up should catch faster (prevents black bars when scrubbing upward)
    // - moving down is a bit slower/more intentional
    const distY = Math.abs(dy);
    const boostY = Math.min(0.12, distY / 1200); // adaptive catch-up for big jumps
    const aTop = Math.min(
      0.32,
      (dy < 0 ? 0.20 : 0.10) + boostY
    );

    const distH = Math.abs(dh);
    const boostH = Math.min(0.10, distH / 1400);
    const aH = Math.min(0.35, 0.22 + boostH);

    pillTop.set(curTop + dy * aTop);
    pillH.set(curH + dh * aH);

    rafRef.current = requestAnimationFrame(track);
  };

  const showPillFor = (href: string | null) => {
    activeHrefRef.current = href;

    if (!href) {
      stopTrack();
      animate(pillO, 0, { duration: reduce ? 0 : 0.12, ease: "linear" });
      return;
    }

    // snap-on-first-show to avoid any initial “bars”
    if (pillO.get() < 0.01) {
      const t = measureActive();
      if (t) {
        pillTop.set(t.top);
        pillH.set(t.height);
      }
    }

    animate(pillO, 1, { duration: reduce ? 0 : 0.14, ease: [0.2, 0, 0, 1] });

    if (!rafRef.current) rafRef.current = requestAnimationFrame(track);
  };

  // close only when leaving the fixed sidebar (stable bounds)
  const leaveTimer = React.useRef<number | null>(null);
  const clearLeaveTimer = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
  };

  const openInternal = (href: string) => {
    clearLeaveTimer();
    setHoverHref(href);
  };

  const openExternal = () => {
    clearLeaveTimer();
    setHoverHref(null);
  };

  const closeAll = () => {
    clearLeaveTimer();
    leaveTimer.current = window.setTimeout(() => setHoverHref(null), reduce ? 0 : 60);
  };

  // measure a row once and set a spacer that pushes the list down
  React.useEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLAnchorElement>('a[href="/about"]');
      if (!el) {
        setRowSpacer(30 * TOP_OFFSET_ROWS);
        return;
      }
      const r = el.getBoundingClientRect();
      const perRow = r.height + 6;
      setRowSpacer(Math.round(perRow * TOP_OFFSET_ROWS));
    };

    const id = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearLeaveTimer();
        setHoverHref(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    setHoverHref(null);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) setHoverHref(null);
  }, [open]);

  // drive the pill from hoverHref (internal only)
  React.useEffect(() => {
    const active = hoverHref && PREVIEW[hoverHref] ? hoverHref : null;
    showPillFor(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverHref, reduce]);

  React.useEffect(() => {
    return () => stopTrack();
  }, []);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="sidebar"
          initial={{ x: -260 }}
          animate={{ x: 0 }}
          exit={{ x: -260 }}
          transition={reduce ? { duration: 0.2 } : { duration: 0.42, ease: EASE_DECEL }}
          className="fixed left-0 top-0 z-[50] h-dvh w-[240px] bg-black not-prose pointer-events-auto"
          style={{ isolation: "isolate" }}
          onPointerEnter={clearLeaveTimer}
          onPointerLeave={closeAll}
        >
          <div className="relative z-[1] flex h-full flex-col px-4 py-6">
            <LayoutGroup id="sidebar-nav">
              <div ref={listRef} className="relative flex flex-col gap-1 overflow-visible bg-black">
                {/* pill overlay (single element) */}
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 z-0 rounded-2xl bg-white shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
                  style={{
                    top: pillTop,
                    height: pillH,
                    opacity: pillO,
                    willChange: "top,height,opacity",
                  }}
                />

                <div style={{ height: rowSpacer || 0 }} aria-hidden="true" />

                {nav.map((item) => {
                  const active = pathname === item.href;
                  const isExternal = !!item.external;
                  const openCard = hoverHref === item.href && !isExternal;
                  const p = PREVIEW[item.href as keyof typeof PREVIEW];

                  return (
                    <HoverCardRow
                      key={item.href}
                      rowRef={(el) => {
                        rowRefs.current[item.href] = el;
                      }}
                      href={item.href}
                      label={item.label}
                      active={active}
                      external={isExternal}
                      open={openCard}
                      badge={p?.badge}
                      title={p?.title}
                      blurb={p?.blurb}
                      onEnterInternal={() => openInternal(item.href)}
                      onEnterExternal={openExternal}
                      onLeaveAll={closeAll}
                      reduceMotion={reduce}
                    />
                  );
                })}
              </div>
            </LayoutGroup>

            <div className="mt-auto" />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
