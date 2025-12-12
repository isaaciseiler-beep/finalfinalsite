// components/FooterGradient.tsx — DROP-IN REPLACEMENT
"use client";

import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

export default function FooterGradient() {
  const { scrollYProgress } = useScroll();
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setAtEnd(v >= 0.995));
    return () => unsub();
  }, [scrollYProgress]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed bottom-0 left-0 w-full h-[120px] z-[1] mix-blend-normal"
      style={{
        background:
          "linear-gradient(to top, rgb(0,0,0) 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%)",
        opacity: atEnd ? 0 : 1,
        transition: "opacity 0.4s ease-out",
      }}
    />
  );
}
