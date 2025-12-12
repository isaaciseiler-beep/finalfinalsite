// app/projects/layout.tsx  ← NEW
"use client";
import Reveal from "@/components/Reveal";
export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <Reveal>{children}</Reveal>;
}
