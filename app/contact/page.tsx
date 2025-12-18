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
  blobRgb: string; // "r g b"
  seed: "connect" | "email";
  external?: boolean;
};

function BlobTile({ label, href, blobColor, blobRgb, seed, external }: BlobTileProps) {
  const ref = React.useRef<HTMLAnchorElement | null>(null);

  const pending = React.useRef<number | null>(null);
  const jiggleTimer = React.useRef<number | null>(null);
  const last = React.useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  const commit = React.useCallback(() => {
    const el = ref.current;
    if (!el) {
      pending.current = null;
      return;
    }

    const { mx, my, rx, ry } = last.current;
    el.style.setProperty("--mx", `${mx.toFixed(2)}px`);
    el.style.setProperty("--my", `${my.toFixed(2)}px`);
    el.style.setProperty("--hx", `${(mx * 1.2).toFixed(2)}px`);
    el.style.setProperty("--hy", `${(my * 1.2).toFixed(2)}px`);
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);

    pending.current = null;
  }, []);

  const scheduleCommit = React.useCallback(() => {
    if (pending.current == null) pending.current = window.requestAnimationFrame(commit);
  }, [commit]);

  const setJiggle = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    el.dataset.jiggle = "1";

    if (jiggleTimer.current != null) window.clearTimeout(jiggleTimer.current);
    jiggleTimer.current = window.setTimeout(() => {
      const node = ref.current;
      if (node) delete node.dataset.jiggle;
    }, 90); // stops quickly after mouse stops
  }, []);

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLAnchorElement>) => {
      const el = ref.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      const py = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;

      // smaller travel so the blob never hits the edge
      const mx = clamp(px, -1, 1) * 11;
      const my = clamp(py, -1, 1) * 11;

      last.current = {
        mx,
        my,
        rx: clamp(py, -1, 1) * -4.8,
        ry: clamp(px, -1, 1) * 4.8,
      };

      setJiggle();
      scheduleCommit();
    },
    [scheduleCommit, setJiggle]
  );

  const onPointerLeave = React.useCallback(() => {
    const el = ref.current;
    if (el) delete el.dataset.jiggle;

    if (jiggleTimer.current != null) window.clearTimeout(jiggleTimer.current);

    last.current = { mx: 0, my: 0, rx: 0, ry: 0 };
    scheduleCommit();
  }, [scheduleCommit]);

  React.useEffect(() => {
    return () => {
      if (pending.current != null) window.cancelAnimationFrame(pending.current);
      if (jiggleTimer.current != null) window.clearTimeout(jiggleTimer.current);
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
      style={
        {
          ["--blob" as any]: blobColor,
          ["--blob-rgb" as any]: blobRgb,
        } as React.CSSProperties
      }
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
                  blobRgb="62 80 205"
                  seed="connect"
                />
              </div>

              <div className="flex items-end justify-center md:flex-1">
                <BlobTile
                  label="Email"
                  href="mailto:isaaciseiler@gmail.com"
                  blobColor="#aa96af"
                  blobRgb="170 150 175"
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
