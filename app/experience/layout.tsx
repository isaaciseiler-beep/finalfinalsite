// app/experience/layout.tsx — DROP-IN REPLACEMENT
"use client";

import Reveal from "@/components/Reveal";

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Reveal>{children}</Reveal>;
}
