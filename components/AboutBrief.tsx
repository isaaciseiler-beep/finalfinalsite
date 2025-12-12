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
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <div ref={ref} className="w-full">
      <section className="relative min-h-screen w-full overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-bg">
        {/* Background image (parallax) */}
        <motion.div
          aria-hidden="true"
          style={{ y, backgroundImage: `url(${BG_IMAGE_URL})` }}
          className="absolute -inset-10 bg-cover bg-center will-change-transform"
        />

        {/* Bottom-left overlay card */}
        <Link
          href="/about"
          aria-label="About me"
          className="group absolute bottom-6 left-6 md:bottom-8 md:left-8 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <div className="rounded-2xl md:rounded-3xl bg-gradient-to-tr from-bg/85 via-bg/65 to-bg/45 backdrop-blur-md px-5 py-4 md:px-6 md:py-5 shadow-lg ring-1 ring-fg/10">
            <div className="text-sm md:text-base font-medium tracking-tight text-fg/90">
              I’m Isaac
            </div>

            <div className="mt-1 flex items-baseline gap-2 text-lg md:text-xl font-semibold tracking-tight text-fg">
              <span className="underline-offset-4 decoration-1 decoration-fg/60 group-hover:underline">
                About me
              </span>
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </div>
          </div>
        </Link>
      </section>
    </div>
  );
}
