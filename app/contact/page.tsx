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
  seed: "connect" | "email";
  external?: boolean;
};

function BlobTile({ label, href, blobColor, seed, external }: BlobTileProps) {
  const ref = React.useRef<HTMLAnchorElement | null>(null);
  const raf = React.useRef<number | null>(null);

  const target = React.useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  const current = React.useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  const tick = React.useCallback(() => {
    const el = ref.current;
    if (!el) {
      raf.current = null;
      return;
    }

    const t = target.current;
    const c = current.current;

    // spring smoothing: higher = snappier
    const s = 0.16;

    c.mx += (t.mx - c.mx) * s;
    c.my += (t.my - c.my) * s;
    c.rx += (t.rx - c.rx) * s;
    c.ry += (t.ry - c.ry) * s;

    el.style.setProperty("--mx", `${c.mx.toFixed(2)}px`);
    el.style.setProperty("--my", `${c.my.toFixed(2)}px`);
    el.style.setProperty("--hx", `${(c.mx * 1.35).toFixed(2)}px`);
    el.style.setProperty("--hy", `${(c.my * 1.35).toFixed(2)}px`);
    el.style.setProperty("--rx", `${c.rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${c.ry.toFixed(2)}deg`);

    const done =
      Math.abs(t.mx - c.mx) < 0.02 &&
      Math.abs(t.my - c.my) < 0.02 &&
      Math.abs(t.rx - c.rx) < 0.02 &&
      Math.abs(t.ry - c.ry) < 0.02;

    if (!done) raf.current = window.requestAnimationFrame(tick);
    else raf.current = null;
  }, []);

  const kick = React.useCallback(() => {
    if (raf.current == null) raf.current = window.requestAnimationFrame(tick);
  }, [tick]);

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      const el = ref.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      const py = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;

      target.current = {
        mx: clamp(px, -1, 1) * 16,
        my: clamp(py, -1, 1) * 16,
        rx: clamp(py, -1, 1) * -7,
        ry: clamp(px, -1, 1) * 7,
      };

      kick();
    },
    [kick]
  );

  const onPointerLeave = React.useCallback(() => {
    target.current = { mx: 0, my: 0, rx: 0, ry: 0 };
    kick();
  }, [kick]);

  React.useEffect(() => {
    return () => {
      if (raf.current != null) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <a
      ref={ref}
      data-seed={seed}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ ["--blob" as any]: blobColor } as React.CSSProperties}
      className="contact-tile contact-tile--square focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      aria-label={label}
    >
      <span className="contact-tile__plate" aria-hidden="true" />

      <span className="contact-tile__blobCenter" aria-hidden="true">
        <span className="contact-tile__blobTilt">
          <span className="contact-tile__blob">
            <span className="contact-tile__shine" />
            <span className="contact-tile__rim" />
            <span className="contact-tile__blobLabel">{label}</span>
          </span>
        </span>
      </span>

      <div className="contact-tile__plateLabel">{label}</div>
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
                  seed="connect"
                />
              </div>

              <div className="flex items-end justify-center md:flex-1">
                <BlobTile
                  label="Email"
                  href="mailto:isaaciseiler@gmail.com"
                  blobColor="#aa96af"
                  seed="email"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
