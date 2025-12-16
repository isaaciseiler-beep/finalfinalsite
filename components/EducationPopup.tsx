// components/EducationPopup.tsx — DROP-IN REPLACEMENT
"use client";

import { motion } from "framer-motion";
import type React from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
};

export default function EducationPopup({ open, onToggle }: Props) {
  return (
    <motion.div
      layout
      initial={false}
      onClick={onToggle}
      className="relative w-full cursor-pointer overflow-hidden rounded-2xl px-5 py-5 text-sm text-white md:px-6 md:py-6 md:text-base focus:outline-none focus-visible:outline-none"
      variants={{
        closed: {
          backgroundColor: "#000000",
          color: "#ffffff",
          boxShadow: "0 10px 26px rgba(0,0,0,0.45)",
        },
        open: {
          backgroundColor: "#1808d1",
          color: "#ffffff",
          boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
        },
      }}
      animate={open ? "open" : "closed"}
      whileHover={
        open
          ? {}
          : {
              backgroundColor: "#ffffff",
              color: "#000000",
            }
      }
      transition={{
        layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        backgroundColor: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        color: { duration: 0.3, ease: "easeOut" },
        boxShadow: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {/* animated background, always present, more pronounced */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.8 }}
        animate={{
          opacity: open ? 0.3 : [0.6, 1, 0.6],
        }}
        transition={{
          opacity: open
            ? { duration: 0.4, ease: "easeOut" }
            : { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* left-to-right soft wave */}
        <motion.div
          className="absolute -inset-10"
          style={{
            background:
              "radial-gradient(140% 220% at 0% 60%, rgba(255,255,255,0.16), transparent 65%)",
            filter: "blur(20px)",
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
          className="absolute -inset-12"
          style={{
            background:
              "radial-gradient(130% 210% at 100% 40%, rgba(255,255,255,0.12), transparent 65%)",
            filter: "blur(22px)",
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

      {/* content shell */}
      <div className="relative z-10">
        {/* header row (updated: matches page header typography) */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-5xl font-normal leading-none tracking-tight md:text-7xl">
              Educational Credentials
            </div>
          </div>

          <span
            aria-hidden
            className="mt-1 text-xl md:mt-2 md:text-2xl transition-transform duration-300"
          >
            {open ? "↑" : "↓"}
          </span>
        </div>

        {/* expanding content area */}
        <motion.div
          layout
          initial={false}
          animate={open ? "expanded" : "collapsed"}
          variants={{
            collapsed: { opacity: 0, height: 0, marginTop: 0 },
            expanded: { opacity: 1, height: "auto", marginTop: 18 },
          }}
          transition={{
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ overflow: "hidden" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-sm md:text-base">
            <div className="space-y-8 md:space-y-10 text-white/95">
              {/* WashU */}
              <section className="space-y-4">
                <header className="space-y-1">
                  <div className="text-xl md:text-2xl">
                    Washington University in St. Louis
                  </div>
                  <div className="text-base md:text-lg">
                    A.B. Sociology &amp; Political Science
                  </div>
                </header>

                <dl className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <dt className="text-base md:text-lg">Graduation Date</dt>
                    <dd>May 2025</dd>
                  </div>
                  <div>
                    <dt className="text-base md:text-lg">Honors</dt>
                    <dd>Magna Cum Laude</dd>
                  </div>
                  <div>
                    <dt className="text-base md:text-lg">GPA</dt>
                    <dd>4.00 / 4.00</dd>
                  </div>
                </dl>

                <div className="space-y-2">
                  <h3 className="text-base md:text-lg">
                    Scholarships &amp; Fellowships
                  </h3>
                  <div className="flex flex-col gap-1">
                    <UnderlineLink href="https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/">
                      Rhodes Scholarship Finalist
                    </UnderlineLink>
                    <UnderlineLink href="https://www.truman.gov/">
                      Harry S. Truman Scholarship
                    </UnderlineLink>
                    <UnderlineLink href="https://www.fulbright.org.tw/">
                      Fulbright Scholar, Taiwan
                    </UnderlineLink>
                    <UnderlineLink href="https://undergradresearch.wustl.edu/summer-undergraduate-research-award-su24">
                      Summer Undergraduate Research Award (WashU)
                    </UnderlineLink>
                  </div>
                </div>
              </section>

              {/* NOLS */}
              <section className="space-y-2">
                <h3 className="text-base md:text-lg">
                  National Outdoor Leadership School (NOLS)
                </h3>
                <p className="text-sm md:text-base">
                  2021 Summer Leadership Semester in Alaska. Focus on risk
                  management, environmental studies, and glaciology.
                </p>
                <UnderlineLink href="https://www.nols.edu/courses/summer-semester-in-alaska-SAK/">
                  Read more about the program
                </UnderlineLink>
              </section>

              {/* Calvin */}
              <section className="space-y-1 text-sm md:text-base">
                <p>
                  I transferred from Calvin University Honors College after my
                  sophomore year.
                </p>
                <UnderlineLink href="https://calvinchimes.org/2022/12/04/social-work-students-struggled-in-wake-of-csr-split-frustration-remains/">
                  Read more about my decision here
                </UnderlineLink>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** animated underline link — single custom underline, arrow not underlined */
function UnderlineLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-baseline gap-1 text-base"
      style={{ textDecoration: "none" }}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]"
        style={{ textDecoration: "none" }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="text-sm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{ textDecoration: "none" }}
      >
        ↗
      </span>
    </a>
  );
}

