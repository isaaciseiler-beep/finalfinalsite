"use client";

import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
import BrandMark from "./BrandMark";
import { useSidebar } from "./SidebarContext";

const LOGO_SCALE = 1.5;
const ICON_SIZE = 19.2; // 20% bigger than 16

export default function Brand() {
  const { open, setOpen } = useSidebar();

  return (
    <div className="fixed left-6 top-8 z-[60] select-none">
      <div
        className="relative isolate inline-flex items-center whitespace-nowrap"
        style={{ gap: "0.375rem" }}
      >
        <Link
          href="/"
          aria-label="go home"
          className="relative z-0 inline-flex items-center focus:outline-none no-underline hover:no-underline shrink-0"
          style={{
            transform: `scale(${LOGO_SCALE})`,
            transformOrigin: "left center",
          }}
        >
          <BrandMark />
        </Link>

        <button
          aria-label={open ? "close navigation" : "open navigation"}
          onClick={() => setOpen(!open)}
          className="relative z-10 p-2 transition hover:opacity-80 focus:outline-none shrink-0"
          type="button"
        >
          {open ? <ArrowLeft size={ICON_SIZE} /> : <Menu size={ICON_SIZE} />}
        </button>
      </div>
    </div>
  );
}
