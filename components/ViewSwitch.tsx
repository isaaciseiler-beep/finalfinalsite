// components/ViewSwitch.tsx — DROP-IN REPLACEMENT (uses card gray exactly)
"use client";

import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Mode = "cards" | "timeline";
const PADDING = 4; // px inside rounded track

function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function ViewSwitch({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  const isOn = mode === "timeline";
  const prefersReduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);

  // geometry: pill is half of inner width; stays centered vertically
  const [dims, setDims] = useState({ innerW: 0, innerH: 0, travel: 0, thumbW: 0 });
  const x = useMotionValue(0);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const innerW = Math.max(0, Math.floor(r.width - PADDING * 2));
      const innerH = Math.max(0, Math.floor(r.height - PADDING * 2));
      const thumbW = Math.floor(innerW / 2);
      const travel = thumbW;
      setDims({ innerW, innerH, travel, thumbW });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // sync animation with state/size
  useEffect(() => {
    const target = isOn ? dims.travel : 0;
    const controls = animate(x, target, {
      type: "tween",
      ease: [0.16, 1, 0.3, 1], // fast → slow
      duration: prefersReduced ? 0.15 : 0.45,
    });
    return () => controls.stop();
  }, [isOn, dims.travel, prefersReduced, x]);

  const commit = (nextOn: boolean) => {
    if (nextOn !== isOn) onChange(nextOn ? "timeline" : "cards");
  };

  return (
    <div className="w-full min-h-[22vh] grid place-items-center">
      <div
        ref={trackRef}
        role="switch"
        aria-checked={isOn}
        aria-label="Toggle experience view"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            commit(!isOn);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            commit(false);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            commit(true);
          }
        }}
        onClick={() => commit(!isOn)}
        className={cx(
          "relative cursor-pointer select-none rounded-full outline-none",
          // exact same gray as cards:
          "bg-neutral-900"
        )}
        style={{
          width: "min(56rem, max(280px, 50vw))", // ≈ half page
          height: 44,
          padding: PADDING,
        }}
      >
        {/* sliding pill: black; no borders/shadows; perfectly centered */}
        <motion.div
          aria-hidden
          className="absolute left-1 top-1 rounded-full bg-black"
          style={{
            x,
            width: dims.thumbW,
            height: dims.innerH,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: dims.travel }}
          dragElastic={0.12}
          dragMomentum={!prefersReduced}
          onDragEnd={(_, info) => {
            const left = trackRef.current?.getBoundingClientRect().left ?? 0;
            const posX = info.point.x - left - PADDING;
            const nextOn = posX > dims.travel / 2 || info.velocity.x > 300;
            commit(nextOn);
          }}
          transition={{
            type: "tween",
            ease: [0.16, 1, 0.3, 1], // fast→slow
            duration: prefersReduced ? 0.12 : 0.35,
          }}
        />

        {/* labels inside halves; active = white, inactive = black */}
        <div className="relative grid h-full w-full grid-cols-2 text-base">
          <div className="flex items-center justify-center">
            <span className={cx(isOn ? "text-black" : "text-white font-medium")}>Cards</span>
          </div>
          <div className="flex items-center justify-center">
            <span className={cx(isOn ? "text-white font-medium" : "text-black")}>Timeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
