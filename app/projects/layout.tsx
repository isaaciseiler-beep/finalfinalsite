// app/projects/layout.tsx
"use client";

import Reveal from "@/components/Reveal";

export default function ProjectsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <Reveal>{children}</Reveal>
      {modal}
    </>
  );
}
