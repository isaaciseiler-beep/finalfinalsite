// components/NowStatus.tsx — DROP-IN REPLACEMENT (smoother background)
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function NowStatus() {
  return (
    <section className="mt-10 w-full">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-950 shadow-[0_0_26px_rgba(0,0,0,0.45)] backdrop-blur-md">
        {/* smooth, organic wave background (no lines, no seam) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.4, 0.85, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* left-to-right soft wave */}
          <motion.div
            className="absolute -inset-8"
            style={{
              background:
                "radial-gradient(140% 220% at 0% 60%, rgba(255,255,255,0.06), transparent 65%)",
              filter: "blur(18px)",
            }}
            initial={{ x: "-18%" }}
            animate={{ x: ["-18%", "26%"] }}
            transition={{
              duration: 14,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          {/* secondary diagonal wave */}
          <motion.div
            className="absolute -inset-10"
            style={{
              background:
                "radial-gradient(130% 210% at 100% 40%, rgba(255,255,255,0.04), transparent 65%)",
              filter: "blur(20px)",
            }}
            initial={{ x: "20%", y: "-6%" }}
            animate={{ x: ["20%", "-10%"], y: ["-6%", "6%"] }}
            transition={{
              duration: 16,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* content */}
        <div className="relative z-10 px-6 py-9 sm:px-8 sm:py-11">
          <div className="flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
            {/* left */}
            <div>
              <div className="flex items-center gap-2.5 text-[13px] leading-none text-neutral-300">
                <motion.span
                  aria-hidden
                  className="inline-block h-3 w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.65)]"
                  animate={{ scale: [0.9, 1.2, 0.9] }}
                  transition={{
                    duration: 1.9,
                    repeat: Infinity,
                    ease: [0.45, 0, 0.55, 1],
                  }}
                />
                <span className="uppercase">status</span>
              </div>

              <p className="mt-3 text-[1.35rem] leading-snug text-neutral-50 sm:text-[1.45rem]">
                Based in Taipei →
              </p>
              <p className="mt-2 text-[1.1rem] leading-relaxed text-neutral-200 sm:text-[1.15rem]">
                Messing around with AI, current Fulbright Scholar, seeking jobs in tech
                and AI starting mid-2026.
              </p>
            </div>

            {/* contact (underline ONLY on text span; no double underline; arrow is ↗ only) */}
            <Link
              href="/contact"
              aria-label="Go to contact page"
              className="group inline-flex items-center gap-1 text-base font-medium text-neutral-50 no-underline hover:no-underline"
            >
              <span className="relative pb-0.5 bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]">
                Contact
              </span>
              <span
                aria-hidden
                className="text-sm no-underline transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
