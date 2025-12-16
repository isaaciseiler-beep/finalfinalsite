"use client";

export const dynamic = "force-static";

import * as React from "react";

type BlobTileProps = {
  label: string;
  subtitle: string;
  href: string;
  blobColor: string;
  hoverTextClassName: string;
  align: "start" | "end";
  external?: boolean;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function BlobTile({
  label,
  subtitle,
  href,
  blobColor,
  hoverTextClassName,
  align,
  external,
  className,
}: BlobTileProps) {
  const ref = React.useRef<HTMLAnchorElement | null>(null);
  const raf = React.useRef<number | null>(null);
  const last = React.useRef({ x: 0, y: 0, rx: 0, ry: 0 });

  const setVars = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { x, y, rx, ry } = last.current;
    el.style.setProperty("--mx", `${x.toFixed(2)}px`);
    el.style.setProperty("--my", `${y.toFixed(2)}px`);
    el.style.setProperty("--hx", `${(x * 1.8).toFixed(2)}px`);
    el.style.setProperty("--hy", `${(y * 1.8).toFixed(2)}px`);
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);

    raf.current = null;
  }, []);

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      const el = ref.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      const py = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;

      const mx = clamp(px, -1, 1) * 14;
      const my = clamp(py, -1, 1) * 14;

      const ry = clamp(px, -1, 1) * 6;
      const rx = clamp(py, -1, 1) * -6;

      last.current = { x: mx, y: my, rx, ry };

      if (raf.current == null) {
        raf.current = window.requestAnimationFrame(setVars);
      }
    },
    [setVars]
  );

  const onPointerLeave = React.useCallback(() => {
    last.current = { x: 0, y: 0, rx: 0, ry: 0 };
    if (raf.current == null) {
      raf.current = window.requestAnimationFrame(setVars);
    }
  }, [setVars]);

  React.useEffect(() => {
    return () => {
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  const contentBaseAlign =
    align === "start"
      ? "items-start justify-start text-left"
      : "items-end justify-end text-right";

  return (
    <a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ ["--blob" as any]: blobColor } as React.CSSProperties}
      className={
        "contact-tile group block w-full rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-white/80 !no-underline hover:!no-underline " +
        (className ?? "")
      }
      aria-label={label}
    >
      <span className="contact-tile__plate" aria-hidden="true" />

      <span className="contact-tile__blobCenter" aria-hidden="true">
        <span className="contact-tile__blobTilt">
          <span className="contact-tile__blob">
            <span className="contact-tile__shine" />
            <span className="contact-tile__rim" />
          </span>
        </span>
      </span>

      <div
        className={
          "relative z-[2] flex h-full w-full flex-col p-8 md:p-10 text-black transition-all duration-500 ease-out " +
          contentBaseAlign +
          " group-hover:items-center group-hover:justify-center group-hover:text-center " +
          hoverTextClassName
        }
      >
        <div className="text-[clamp(36px,6vw,72px)] font-normal leading-none tracking-tightish">
          {label}
        </div>
        <div className="mt-3 text-sm tracking-tight opacity-80 md:text-base">
          {subtitle}
        </div>
      </div>
    </a>
  );
}

export default function Contact() {
  return (
    <main className="w-full px-6 pt-10 md:pt-14 pb-0 h-[calc(100dvh-var(--footer-h,88px))] overflow-hidden">
      <div className="-mx-4 sm:-mx-6 h-full">
        <div className="flex h-full flex-col px-4 sm:px-6 pt-[112px] md:pt-[112px]">
          <div className="min-h-0 flex-1">
            <div className="flex h-full min-h-0 flex-col gap-4 md:flex-row md:gap-6">
              <div className="flex min-h-0 flex-1 md:items-start">
                <BlobTile
                  label="Connect"
                  subtitle="linkedin.com/in/isaacseiler"
                  href="https://www.linkedin.com/in/isaacseiler/"
                  external
                  blobColor="#3e50cd"
                  hoverTextClassName="group-hover:text-white"
                  align="start"
                  className="h-full md:h-[92%]"
                />
              </div>

              <div className="flex min-h-0 flex-1 md:items-end">
                <BlobTile
                  label="Email"
                  subtitle="isaaciseiler@gmail.com"
                  href="mailto:isaaciseiler@gmail.com"
                  blobColor="#aa96af"
                  hoverTextClassName="group-hover:text-black/90"
                  align="end"
                  className="h-full md:h-[92%]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <svg width="0" height="0" className="absolute">
        <filter id="contactGel" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.7" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feComposite in="goo" in2="SourceGraphic" operator="atop" />
        </filter>
      </svg>
    </main>
  );
}
