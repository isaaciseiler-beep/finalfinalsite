"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";


export default function AboutBrief() {
const ref = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], [0, -30]);


return (
<div ref={ref} className="w-full">
<div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">
<motion.div style={{ y }} className="md:col-span-4 relative aspect-[4/5] overflow-hidden">
<Image
src="/images/me.jpg" // replace with your asset
alt="portrait of isaac"
fill
className="object-cover"
sizes="(max-width: 768px) 100vw, 33vw"
priority
/>
</motion.div>
<div className="md:col-span-8">
<h2 className="text-xl md:text-2xl font-semibold tracking-tight">about</h2>
<p className="mt-4 text-sm md:text-base text-fg/80">
i build ai‑forward products and education programs. fulbright taiwan
scholar, product and comms background, photographer. i like simple
systems that scale, clear interfaces, and shipping work that helps
people do more with less.
</p>
</div>
</div>
</div>
);
}
