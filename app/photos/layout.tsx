// app/photos/layout.tsx
"use client";

import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

export default function PhotosLayout({ children }: { children: ReactNode }) {
  return <Reveal>{children}</Reveal>;
}
