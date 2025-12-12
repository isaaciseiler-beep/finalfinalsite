// app/contact/layout.tsx  ← NEW
"use client";
import Reveal from "@/components/Reveal";
export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <Reveal>{children}</Reveal>;
}
