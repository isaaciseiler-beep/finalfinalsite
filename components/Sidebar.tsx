"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import { useSidebar } from "./SidebarContext";
import HoverCardRow from "./HoverCardRow";

type NavItem = { href: string; label: string; external?: boolean };

const nav: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/photos", label: "Photos" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
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
  "/blog": { badge: "notes", title: "blog", blurb: "Thoughts and opinions" },
};

// menu slide ease (no bounce)
const EASE_DECEL: [number, number, number, number] = [0.05, 0.7, 0.12, 1];

// how many row-heights to skip before first menu item
const TOP_OFFSET_ROWS = 3;

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const reduce = !!useReducedMotion();

  const [hoverHref, setHoverHref] = React.useState<string | null>(null);

  // Keep the highlight pill alive independently of hoverHref so we can
  // fade it out without any layout/opacity “blips”.
  const [pillHref, setPillHref] = React.useState<string | null>(null);
  const [pillVisible, setPillVisible] = React.useState(false);

  // top padding as “rows” (start with a stable fallback to avoid first-paint jump)
  const [rowSpacer, setRowSpacer] = React.useState<number>(() => 30 * TOP_OFFSET_ROWS);

  // Close only when leaving the fixed sidebar (stable bounds)
  const leaveTimer = React.useRef<number | null>(null);
  const cleanupTimer = React.useRef<number | null>(null);
  const clearLeaveTimers = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    if (cleanupTimer.current) window.clearTimeout(cleanupTimer.current);
    leaveTimer.current = cleanupTimer.current = null;
  };

  const openRow = (href: string) => {
    clearLeaveTimers();
    setHoverHref(href);
    setPillHref(href);
    setPillVisible(true);
  };

  const closeAll = () => {
    clearLeaveTimers();

    const leaveDelay = reduce ? 0 : 60;
    const fadeMs = reduce ? 0 : 160;

    leaveTimer.current = window.setTimeout(() => {
      setHoverHref(null);
      setPillVisible(false);

      cleanupTimer.current = window.setTimeout(() => {
        setPillHref(null);
      }, fadeMs);
    }, leaveDelay);
  };

  // Measure a row once and set a spacer that pushes the list down.
  // Use layout timing + observers to avoid any “jump” on mount/resizes.
  React.useLayoutEffect(() => {
    if (!open) return;

    const el = document.querySelector<HTMLElement>('a[href="/about"]');
    if (!el) return;

    let raf = 0;
    const measure = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const perRow = r.height + 6; // gap-1 ~= 4px, + slack
        setRowSpacer(Math.round(perRow * TOP_OFFSET_ROWS));
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [open]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearLeaveTimers();
        setHoverHref(null);
        setPillVisible(false);
        setPillHref(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    // navigating should never leave hover state stuck
    clearLeaveTimers();
    setHoverHref(null);
    setPillVisible(false);
    setPillHref(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  React.useEffect(() => {
    if (!open) {
      clearLeaveTimers();
      setHoverHref(null);
      setPillVisible(false);
      setPillHref(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
          onPointerEnter={clearLeaveTimers}
          onPointerLeave={closeAll}
        >
          <div className="relative z-[1] flex h-full flex-col px-4 py-6">
            <LayoutGroup id="sidebar-nav">
              <div className="relative flex flex-col gap-1 overflow-visible">
                <div style={{ height: rowSpacer || 0 }} aria-hidden="true" />

                {nav.map((item) => {
                  const active = pathname === item.href;
                  const isExternal = !!item.external;
                  const highlighted = hoverHref === item.href;
                  const p = PREVIEW[item.href as keyof typeof PREVIEW];

                  return (
                    <HoverCardRow
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      active={active}
                      external={isExternal}
                      open={highlighted}
                      pill={pillHref === item.href}
                      pillVisible={pillVisible}
                      badge={p?.badge}
                      title={p?.title}
                      blurb={p?.blurb}
                      onEnterInternal={() => openRow(item.href)}
                      onEnterExternal={() => openRow(item.href)}
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
