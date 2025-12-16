"use client";

export const dynamic = "force-static";

import * as React from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type BlobTileProps = {
  label: string;
  href: string;
  blobColor: string;
  hoverTextClassName: string;
  external?: boolean;
};

function BlobTile({ label, href, blobColor, hoverTextClassName, external }: BlobTileProps) {
  const ref = React.useRef<HTMLAnchorElement | null>(null);
  const raf = React.useRef<number | null>(null);

  const last = React.useRef({
    mx: 0,
    my: 0,
    hx: 0,
    hy: 0,
    rx: 0,
    ry: 0,
  });

  const applyVars = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { mx, my, hx, hy, rx, ry } = last.current;
    el.style.setProperty("--mx", `${mx.toFixed(2)}px`);
    el.style.setProperty("--my", `${my.toFixed(2)}px`);
    el.style.setProperty("--hx", `${hx.toFixed(2)}px`);
    el.style.setProperty("--hy", `${hy.toFixed(2)}px`);
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

      const mx = clamp(px, -1, 1) * 16;
      const my = clamp(py, -1, 1) * 16;

      last.current = {
        mx,
        my,
        hx: mx * 1.6,
        hy: my * 1.6,
        rx: clamp(py, -1, 1) * -6,
        ry: clamp(px, -1, 1) * 6,
      };

      if (raf.current == null) raf.current = window.requestAnimationFrame(applyVars);
    },
    [applyVars]
  );

  const onPointerLeave = React.useCallback(() => {
    last.current = { mx: 0, my: 0, hx: 0, hy: 0, rx: 0, ry: 0 };
    if (raf.current == null) raf.current = window.requestAnimationFrame(applyVars);
  }, [applyVars]);

  React.useEffect(() => {
    return () => {
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ ["--blob" as any]: blobColor } as React.CSSProperties}
      className="contact-tile contact-tile--square group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
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

      <div className="relative z-[2] flex h-full w-full items-center justify-center">
        <div
          className={
            "text-[clamp(44px,7vw,88px)] font-normal leading-none tracking-tight text-black transition-colors duration-300 " +
            hoverTextClassName
          }
        >
          {label}
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
            <div className="flex h-full flex-col justify-between gap-4 md:flex-row md:gap-6">
              <div className="flex items-start justify-center md:flex-1">
                <BlobTile
                  label="Connect"
                  href="https://www.linkedin.com/in/isaaciseiler/"
                  external
                  blobColor="#3e50cd"
                  hoverTextClassName="group-hover:text-white"
                />
              </div>

              <div className="flex items-end justify-center md:flex-1">
                <BlobTile
                  label="Email"
                  href="mailto:isaaciseiler@gmail.com"
                  blobColor="#aa96af"
                  hoverTextClassName="group-hover:text-black/90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
