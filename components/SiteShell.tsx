// components/SiteShell.tsx
// sidebar-aware shell that reserves space for the sidebar and keeps page content in sync.
"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSidebar } from "./SidebarContext";

// keep in sync with Sidebar.tsx width
const SIDEBAR_W = 240;
const EASE_DECEL: [number, number, number, number] = [0.05, 0.7, 0.2, 1];

export default function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open } = useSidebar();
  const reduce = !!useReducedMotion();

  const offset = open ? `${SIDEBAR_W}px` : "0px";

  return (
    <motion.div
      className="min-h-dvh w-full bg-black"
      // drive layout from a css var so children can consume it too.
      style={{ paddingLeft: "var(--sidebar-offset)" } as React.CSSProperties}
      initial={false}
      animate={{
        ["--sidebar-offset" as any]: offset,
        ["--sidebar-width" as any]: offset,
      }}
      transition={
        reduce
          ? { duration: 0.2 }
          : { duration: 0.42, ease: EASE_DECEL }
      }
    >
      {children}
    </motion.div>
  );
}
