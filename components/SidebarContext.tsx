"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; };
const SidebarCtx = createContext<Ctx | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarCtx);
  if (!ctx) throw new Error("SidebarContext missing");
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  // hydrate from localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sidebar-open") : null;
    if (saved !== null) setOpen(saved === "1");
  }, []);

  // persist and set body class
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("sidebar-open", open);
      document.body.classList.toggle("sidebar-closed", !open);
      localStorage.setItem("sidebar-open", open ? "1" : "0");
    }
  }, [open]);

  return <SidebarCtx.Provider value={{ open, setOpen }}>{children}</SidebarCtx.Provider>;
}
