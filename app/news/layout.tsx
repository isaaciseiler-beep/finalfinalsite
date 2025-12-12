// app/news/layout.tsx  ← NEW   (for “In the News”)
"use client";
import Reveal from "@/components/Reveal";
export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <Reveal>{children}</Reveal>;
}
