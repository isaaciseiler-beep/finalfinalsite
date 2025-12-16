"use client";

export const dynamic = "force-static";

import * as React from "react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type TileProps = {
  label: string;
  href: string;
  blobColor: string;
  textOnBlob: string;
  align: "start" | "end";
  external?: boolean;
};

function BlobTile({
  label,
  href,
  blobColor,
  textOnBlob,
  align,
  external,
}: TileProps) {
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

      if (raf.current == null) raf.current = window.requestAnimationFrame(setVars);
    },
    [setVars]
  );

  const onPointerLeave = React.useCallback(() => {
    last.current = { x: 0, y: 0, rx: 0, ry: 0 };
    if (raf.current == null) raf.current = window.requestAnimationFrame(setVars);
  }, [setVars]);

  React.useEffect(() => {
    return () => {
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  const baseAlign =
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
      className="contact-tile group block w-full rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-white/80"
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
          "relative z-[2] flex h-full w-full flex-col p-8 md:p-10 transition-all duration-500 ease-out " +
          baseAlign +
          " group-hover:items-center group-hover:justify-center group-hover:text-center"
        }
      >
        <div className="text-[clamp(44px,7vw,84px)] font-normal leading-none tracking-tight text-black group-hover:text-inherit">
          {label}
        </div>
        <div className="mt-3 text-sm tracking-tight opacity-70 md:text-base text-black group-hover:text-inherit">
          {textOnBlob}
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
              {/* top-anchored */}
              <div className="flex min-h-0 flex-1 md:items-start">
                <BlobTile
                  label="Connect"
                  href="https://www.linkedin.com/in/isaaciseiler/"
                  external
                  blobColor="#3e50cd"
                  textOnBlob="open linkedin"
                  align="start"
                />
              </div>

              {/* bottom-anchored */}
              <div className="flex min-h-0 flex-1 md:items-end">
                <BlobTile
                  label="Email"
                  href="mailto:isaaciseiler@gmail.com"
                  blobColor="#aa96af"
                  textOnBlob="compose email"
                  align="end"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
