"use client";
import { motion } from "framer-motion";

export default function HeaderGradient() {
  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-[50] h-[120px] w-full"
      style={{
        // full black start, exact page color
        background:
          "linear-gradient(to bottom, rgb(0,0,0) 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0) 100%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  );
}
