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

const EASE_DECEL: [number, number, number, number] = [0.05, 0.7, 0.12, 1];
const TOP_OFFSET_ROWS = 3;

export default function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const reduce = !!useReducedMotion();

  const [hoverHref, setHoverHref] = React.useState<string | null>(null);
  const [rowSpacer, setRowSpacer] = React.useState<number>(0);

  // Only used to soften close when leaving the menu entirely (NOT between rows)
  const closeTimer = React.useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const openInternal = (href: string) => {
    clearCloseTimer();
    setHoverHref(href); // IMMEDIATE: no enter delay
  };

  const openExternal = () => {
    clearCloseTimer();
    setHoverHref(null);
  };

  const leaveMenu = () => {
    clearCloseTimer();
    // Small delay prevents accidental flicker if you graze the edge.
    closeTimer.current = window.setTimeout(() => setHoverHref(null), reduce ? 0 : 60);
  };

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
        clearCloseTimer();
        setHoverHref(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    // If we navigate, drop any open hover state
    setHoverHref(null);
  }, [pathname]);

  React.useEffect(() => {
    // If sidebar closes, clear hover
    if (!open) setHoverHref(null);
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
        >
          <div className="relative z-[1] flex h-full flex-col px-4 py-6">
            <LayoutGroup id="sidebar-nav">
              <div
                className="flex flex-col gap-1 overflow-visible bg-black"
                onPointerEnter={clearCloseTimer}
                onPointerLeave={leaveMenu} // close only when leaving the whole menu
              >
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
                      onEnterInternal={() => openInternal(item.href)}
                      onEnterExternal={openExternal}
                      onLeaveAll={leaveMenu} // kept for prop compatibility; row does not close itself anymore
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
