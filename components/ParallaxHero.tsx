// components/ParallaxHero.tsx — DROP-IN REPLACEMENT
"use client";

import Parallax from "./Parallax";
import { motion } from "framer-motion";

type Props = { lines: string[] };

export default function ParallaxHero({ lines }: Props) {
  return (
    <section
      className="relative w-full min-h-dvh grid bg-black"
      aria-label="intro"
    >
      <Parallax
        // stronger pull so the parallax is noticeable immediately.
        amount={-140}
        className="justify-self-end self-end text-right z-30"
        style={{
          paddingRight: "1rem",
          // keep the last line comfortably above the viewport edge / mobile UI.
          paddingBottom: "max(2.25rem, env(safe-area-inset-bottom))",
        }}
      >
        {lines.map((line, i) => (
          <motion.h1
            key={i}
            className="m-0 leading-[0.95] text-white font-normal text-[clamp(2.2rem,7.2vw,7.25rem)]"
            initial={{ y: 12, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.h1>
        ))}
      </Parallax>
    </section>
  );
}
