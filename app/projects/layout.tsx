// app/projects/layout.tsx  ← NEW
"use client";
import Reveal from "@/components/Reveal";

export default function ProjectsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  // IMPORTANT: keep the modal OUTSIDE the Reveal wrapper.
  // Reveal applies a transform; fixed-position elements inside a transformed
  // ancestor become fixed to that ancestor (not the viewport), which breaks
  // centering/overlay behavior.
  return (
    <>
      <Reveal>{children}</Reveal>
      {modal}
    </>
  );
}
