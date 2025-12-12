// components/Brand.tsx  ← DROP-IN REPLACEMENT
"use client";
import Link from "next/link";
import { LayoutGroup, motion } from "framer-motion";
import { ArrowLeft, Menu } from "lucide-react";
import BrandMark, { BRAND_SPRING } from "./BrandMark";
import { useSidebar } from "./SidebarContext";

export default function Brand() {
  const { open, setOpen } = useSidebar();

  return (
    <motion.div
      className="fixed left-6 top-8 z-[60] select-none"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
      <LayoutGroup id="brand-row">
        {/* non-wrapping row; arrow position animates with same spring */}
        <motion.div
          className="inline-flex items-center flex-nowrap whitespace-nowrap gap-3"
          layout // enable layout animation for children
          transition={BRAND_SPRING}
        >
          <Link
            href="/"
            aria-label="go home"
            className="inline-flex items-center focus:outline-none no-underline hover:no-underline shrink-0"
          >
            <BrandMark />
          </Link>

          <motion.button
            aria-label={open ? "close navigation" : "open navigation"}
            onClick={() => setOpen(!open)}
            className="p-2 transition hover:opacity-80 focus:outline-none shrink-0"
            layout="position" // animate positional changes to match logo width spring
            transition={BRAND_SPRING}
          >
            {open ? <ArrowLeft size={16} /> : <Menu size={16} />}
          </motion.button>
        </motion.div>
      </LayoutGroup>
    </motion.div>
  );
}
