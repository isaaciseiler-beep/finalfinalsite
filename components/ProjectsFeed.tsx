"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ProjectsPopup from "@/components/ProjectsPopup";

type Kind = "project" | "blog" | "article";

type FeedItem = {
  id: string;
  kind: Kind;
  kindLabel: string;
  title: string;
  image?: string;
  date?: string;
  summary?: string;
  html: string;
};

type Filter = Kind | null;

const FILTERS: { key: Kind; label: string }[] = [
  { key: "project", label: "projects" },
  { key: "blog", label: "blog" },
  { key: "article", label: "articles" },
];

function useColumnCount() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const mq2 = window.matchMedia("(min-width: 520px)");
    const mq3 = window.matchMedia("(min-width: 1280px)");

    const compute = () => setCols(mq3.matches ? 3 : mq2.matches ? 2 : 1);
    compute();

    mq2.addEventListener("change", compute);
    mq3.addEventListener("change", compute);
    return () => {
      mq2.removeEventListener("change", compute);
      mq3.removeEventListener("change", compute);
    };
  }, []);

  return cols;
}

export default function ProjectsFeed({ items }: { items: FeedItem[] }) {
  const [filter, setFilter] = useState<Filter>(null);
  const [active, setActive] = useState<FeedItem | null>(null);
  const [paneTop, setPaneTop] = useState(112);

  const tabsRef = useRef<HTMLDivElement>(null);
  const cols = useColumnCount();

  const filtered = useMemo(() => {
    if (!filter) return items;
    return items.filter((x) => x.kind === filter);
  }, [filter, items]);

  const columns = useMemo(() => {
    const buckets: FeedItem[][] = Array.from({ length: cols }, () => []);
    filtered.forEach((item, idx) => buckets[idx % cols].push(item));
    return buckets;
  }, [filtered, cols]);

  const measureTabsTop = () => {
    const el = tabsRef.current;
    if (!el) return 112;
    const t = Math.round(el.getBoundingClientRect().top);
    // only trust a reasonable onscreen range
    if (t >= 64 && t <= 260) return t;
    return 112;
  };

  const openItem = (item: FeedItem) => {
    setPaneTop(measureTabsTop());
    setActive(item);
  };

  return (
    <div className="space-y-6">
      {/* filter tabs */}
      <div
        ref={tabsRef}
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {FILTERS.map((f) => {
          const selected = filter === f.key;

          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter((prev) => (prev === f.key ? null : f.key))}
              className={[
                "group relative overflow-hidden rounded-full px-4 py-2 text-sm",
                "border border-white/20",
                "transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                selected ? "bg-neutral-800 text-white" : "bg-transparent text-white",
              ].join(" ")}
            >
              {/* hover fill sweep */}
              <span
                className={[
                  "absolute inset-0 rounded-full bg-white",
                  "origin-left scale-x-0 transition-transform duration-300 ease-out",
                  selected ? "" : "group-hover:scale-x-100",
                ].join(" ")}
              />
              <span
                className={[
                  "relative z-10 transition-colors",
                  selected ? "text-white" : "text-white group-hover:text-black",
                ].join(" ")}
              >
                {f.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* columns layout (stagger middle column in 3-col mode) */}
      <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 xl:grid-cols-3">
        {columns.map((col, colIdx) => (
          <div
            key={`col-${colIdx}`}
            className={[
              "flex flex-col gap-4 sm:gap-5",
              // stagger: ~20% of card height (card is 11/16 => 20% height ≈ 29% width)
              cols === 3 && colIdx === 1 ? "xl:pt-[29%]" : "",
            ].join(" ")}
          >
            {col.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className="group block text-left focus-visible:outline-none"
                aria-haspopup="dialog"
              >
                <article className="relative overflow-hidden rounded-2xl bg-card shadow-[0_0_20px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-transform duration-200 will-change-transform group-hover:-translate-y-0.5">
                  <div className="relative aspect-[11/16] w-full">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 519px) 100vw, (max-width: 1279px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
                    )}

                    {/* kind pill */}
                    <div className="absolute left-3 top-3 z-10">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-background/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur">
                        {item.kindLabel}
                      </span>
                    </div>

                    {/* title */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-6">
                      {/* not bold + ~20% bigger */}
                      <h3 className="line-clamp-2 font-normal leading-tight text-neutral-50 text-xl sm:text-2xl xl:text-3xl">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </article>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* actual popup window */}
      <ProjectsPopup
        open={Boolean(active)}
        entry={
          active
            ? {
                id: active.id,
                kindLabel: active.kindLabel,
                title: active.title,
                image: active.image,
                date: active.date,
                summary: active.summary,
                html: active.html,
              }
            : null
        }
        topPx={paneTop}
        onClose={() => setActive(null)}
      />
    </div>
  );
}

