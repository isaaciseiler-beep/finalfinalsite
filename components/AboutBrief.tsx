"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const BG_IMAGE_URL =
  "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/site/headshotgrad.jpg";

export default function AboutBrief() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // make the photo drift a bit more so the parallax is noticeable.
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div ref={ref} className="w-full">
      <section className="relative min-h-dvh w-full overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-bg">
        {/* Background image (parallax) */}
        <motion.div
          aria-hidden="true"
          style={{ y, backgroundImage: `url(${BG_IMAGE_URL})` }}
          className="absolute -inset-10 bg-cover bg-center will-change-transform"
        />

        {/* bottom fade for readability */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[20%]"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.0) 100%)",
          }}
        />

        {/* Bottom-left link */}
        <Link
          href="/about"
          aria-label="About me"
          className="group absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20 inline-flex items-center gap-2 text-lg md:text-xl font-medium tracking-tight text-white no-underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <span>I’m Isaac</span>
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            ↗
          </span>
        </Link>
      </section>
    </div>
  );
}
