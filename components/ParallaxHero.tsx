// components/ParallaxHero.tsx — DROP-IN REPLACEMENT
"use client";

import Parallax from "./Parallax";
import { motion } from "framer-motion";

type Props = { lines: string[] };

export default function ParallaxHero({ lines }: Props) {
  return (
    <section className="relative w-full min-h-screen grid bg-black" aria-label="intro">
      <Parallax
        amount={-100}
        className="justify-self-end self-end text-right z-30" // ↑ ensures text sits above footer gradient
        style={{ paddingRight: "1rem", paddingBottom: "1rem" }}
      >
        {lines.map((line, i) => (
          <motion.h1
            key={i}
            className="m-0 leading-none text-white font-normal text-[clamp(3rem,10vw,9rem)]"
            initial={{ y: 12, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {line}
          </motion.h1>
        ))}
      </Parallax>
    </section>
  );
}
