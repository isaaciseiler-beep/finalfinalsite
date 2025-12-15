// components/Brand.tsx — DROP-IN REPLACEMENT
"use client";

import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
import BrandMark from "./BrandMark";
import { useSidebar } from "./SidebarContext";

export default function Brand() {
  const { open, setOpen } = useSidebar();

  return (
    <div
      className="inline-flex items-center whitespace-nowrap select-none"
      style={{ gap: "0.375rem" }} // ~50% less than gap-3 (0.75rem)
    >
      <Link
        href="/"
        aria-label="go home"
        className="inline-flex items-center focus:outline-none no-underline hover:no-underline shrink-0"
      >
        <BrandMark />
      </Link>

      <button
        aria-label={open ? "close navigation" : "open navigation"}
        onClick={() => setOpen(!open)}
        className="p-2 transition hover:opacity-80 focus:outline-none shrink-0"
        type="button"
      >
        {open ? <ArrowLeft size={16} /> : <Menu size={16} />}
      </button>
    </div>
  );
}
