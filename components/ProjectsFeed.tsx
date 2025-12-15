"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Kind = "project" | "blog" | "article";

type FeedItem = {
  id: string;
  kind: Kind;
  kindLabel: string;
  href: string;
  title: string;
  image?: string;
};

type Filter = Kind | null;

const FILTERS: { key: Kind; label: string }[] = [
  { key: "project", label: "Projects" },
  { key: "blog", label: "Blog" },
  { key: "article", label: "Articles" },
];

export default function ProjectsFeed({ items }: { items: FeedItem[] }) {
  const [filter, setFilter] = useState<Filter>(null);
  const reduce = useReducedMotion();

  const filtered = useMemo(() => {
    if (!filter) return items;
    return items.filter((x) => x.kind === filter);
  }, [filter, items]);

  return (
    <div className="space-y-6">
      {/* filter tabs (white; clicking active deselects) */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter((prev) => (prev === f.key ? null : f.key))}
              aria-pressed={active}
              className={[
                "shrink-0 rounded-full px-4 py-2 text-sm",
                "border border-white/15",
                "bg-white text-black",
                active
                  ? "shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_10px_30px_rgba(0,0,0,0.35)]"
                  : "opacity-85 hover:opacity-95",
                "transition-[opacity,box-shadow,transform]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 3-column feed, press-style cards */}
      <motion.ol layout className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3">
        <AnimatePresence initial={false}>
          {filtered.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={reduce ? undefined : { opacity: 0, scale: 0.985 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.985 }}
              transition={reduce ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
            >
              <Link href={item.href} scroll={false} className="group block focus-visible:outline-none">
                <article className="relative overflow-hidden rounded-2xl bg-card shadow-[0_0_20px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-transform duration-200 will-change-transform group-hover:-translate-y-0.5 group-active:translate-y-0">
                  <div className="relative aspect-[11/16] w-full">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 33vw, 260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        priority={false}
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
                    )}

                    {/* kind pill (top-left) */}
                    <div className="absolute left-3 top-3 z-10">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-background/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur">
                        {item.kindLabel}
                      </span>
                    </div>

                    {/* bottom gradient & title */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 z-10 p-4">
                      <h3 className="text-sm font-semibold leading-snug text-neutral-50 md:text-base line-clamp-2 max-h-[3.1rem] overflow-hidden">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ol>
    </div>
  );
}
