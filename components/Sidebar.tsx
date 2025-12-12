// components/Sidebar.tsx  ← DROP-IN REPLACEMENT
"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "framer-motion";
import { useSidebar } from "./SidebarContext";
import HoverCardRow from "./HoverCardRow";

type NavItem = { href: string; label: string; external?: boolean };

const nav: NavItem[] = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/photos", label: "Photos" },
  { href: "/news", label: "In the News" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
  {
    href: "https://www.linkedin.com/in/isaacseiler/",
    label: "LinkedIn",
    external: true,
  },
];

const PREVIEW: Record<string, { badge: string; title: string; blurb: string }> = {
  "/about": { badge: "profile", title: "about me", blurb: "bio, values, current focus" },
  "/projects": { badge: "work", title: "projects", blurb: "case studies with crisp visuals" },
  "/experience": { badge: "resume", title: "experience", blurb: "roles, scope, impact" },
  "/photos": { badge: "gallery", title: "photos", blurb: "selected shots + map" },
  "/news": { badge: "press", title: "in the news", blurb: "mentions and highlights" },
  "/contact": { badge: "reach out", title: "contact", blurb: "email form and channels" },
  "/blog": { badge: "notes", title: "blog", blurb: "essays and build logs" },
};

const EASE_DECEL: [number, number, number, number] = [0.05, 0.7, 0.2, 1];

// how many row-heights to skip before first menu item
const TOP_OFFSET_ROWS = 3;

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const reduce = !!useReducedMotion();

  const [hoverHref, setHoverHref] = React.useState<string | null>(null);
  const [rowSpacer, setRowSpacer] = React.useState<number>(0);

  const enterTimer = React.useRef<number | null>(null);
  const leaveTimer = React.useRef<number | null>(null);

  const clearTimers = () => {
    if (enterTimer.current) window.clearTimeout(enterTimer.current);
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    enterTimer.current = leaveTimer.current = null;
  };

  const onEnterInternal = (href: string) => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    if (enterTimer.current) window.clearTimeout(enterTimer.current);
    enterTimer.current = window.setTimeout(() => setHoverHref(href), 110);
  };

  const onEnterExternal = () => {
    clearTimers();
    setHoverHref(null);
  };

  const onLeaveAll = () => {
    if (enterTimer.current) {
      window.clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setHoverHref(null), 140);
  };

  // measure a row once and set a spacer that pushes the list down
  React.useEffect(() => {
    // wait for layout, then measure the first internal link
    const measure = () => {
      const el = document.querySelector<HTMLAnchorElement>('a[href="/about"]');
      if (!el) {
        // safe fallback (~24px row + 6 gap) × rows
        setRowSpacer(30 * TOP_OFFSET_ROWS);
        return;
      }
      const r = el.getBoundingClientRect();
      // include small gap between rows to match existing spacing
      const perRow = r.height + 6;
      setRowSpacer(Math.round(perRow * TOP_OFFSET_ROWS));
    };

    // run after paint so we get final fonts
    const id = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearTimers();
        setHoverHref(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="sidebar"
          initial={{ x: -260 }}
          animate={{ x: 0 }}
          exit={{ x: -260 }}
          transition={
            reduce ? { duration: 0.2 } : { duration: 0.42, ease: EASE_DECEL }
          }
          className="fixed left-0 top-0 z-[50] h-dvh w-[240px] bg-black not-prose pointer-events-auto"
          style={{ isolation: "isolate" }}
        >
          <div className="relative z-[1] flex h-full flex-col px-4 py-6">
            <LayoutGroup>
              <div
                className="flex flex-col gap-1 overflow-visible bg-black"
                onMouseLeave={onLeaveAll}
              >
                {/* spacer pushes the first menu item further down */}
                <div style={{ height: rowSpacer || 0 }} aria-hidden="true" />
                {nav.map((item) => {
                  const active = pathname === item.href;
                  const isExternal = !!item.external;
                  const openCard = hoverHref === item.href && !isExternal;
                  const p = PREVIEW[item.href as keyof typeof PREVIEW];
                  return (
                    <HoverCardRow
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      active={active}
                      external={isExternal}
                      open={openCard}
                      badge={p?.badge}
                      title={p?.title}
                      blurb={p?.blurb}
                      onEnterInternal={() => onEnterInternal(item.href)}
                      onEnterExternal={onEnterExternal}
                      onLeaveAll={onLeaveAll}
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
