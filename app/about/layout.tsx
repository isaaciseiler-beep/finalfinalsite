// app/about/layout.tsx  ← NEW
"use client";
import Reveal from "@/components/Reveal";
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <Reveal>{children}</Reveal>;
}
