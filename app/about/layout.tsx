// app/about/layout.tsx — DROP-IN REPLACEMENT (server layout so metadata works)
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = { title: "about" };

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <Reveal>{children}</Reveal>;
}
