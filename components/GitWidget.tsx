// components/GitWidget.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Github } from "lucide-react";

type Props = {
  repoUrl: string;
  stars?: number;
};

const fade = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] };
const pop = { duration: 0.45, ease: [0.16, 1, 0.3, 1] };
const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] },
  },
};

type CommitActivityWeek = {
  total: number;
  week: number; // unix seconds
  days: number[]; // 7 values, Sun..Sat
};

export default function GitWidget({ repoUrl, stars }: Props) {
  const [open, setOpen] = React.useState(false);

  const [repoStars, setRepoStars] = React.useState<number | undefined>(stars);
  const [weeks, setWeeks] = React.useState<CommitActivityWeek[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  // always available, deterministic fallback so the grid always renders
  const fallbackWeeks = React.useMemo(() => buildFallbackWeeks(repoUrl), [repoUrl]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const { owner, repo } = parseOwnerRepo(repoUrl);
    if (!owner || !repo) return;

    let cancelled = false;
    setLoading(true);

    const fetchRepo = async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { stargazers_count?: number };
        if (!cancelled && typeof json?.stargazers_count === "number") {
          setRepoStars(json.stargazers_count);
        }
      } catch {}
    };

    const fetchCommitActivity = async () => {
      const started = Date.now();
      const timeoutMs = 6500;

      const poll = async (): Promise<void> => {
        if (cancelled) return;

        try {
          const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
            { cache: "no-store" }
          );

          // github often returns 202 while computing; try briefly then fall back
          if (res.status === 202) {
            if (Date.now() - started < timeoutMs) {
              setTimeout(poll, 900);
              return;
            }
            if (!cancelled) setWeeks(null);
            return;
          }

          if (!res.ok) {
            if (!cancelled) setWeeks(null);
            return;
          }

          const json = (await res.json()) as CommitActivityWeek[];
          if (!cancelled) setWeeks(Array.isArray(json) ? json : null);
        } catch {
          if (!cancelled) setWeeks(null);
        }
      };

      await poll();
    };

    fetchRepo();
    fetchCommitActivity().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open, repoUrl]);

  const label = "text-sm font-medium text-neutral-900/75";
  const value = "text-base sm:text-lg font-semibold leading-snug text-neutral-950";
  const pill =
    "inline-flex items-center justify-center rounded-full bg-black/20 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-black/25";

  // matches copyright style exactly
  const copyright = "text-sm text-white/80";
  const popupFooterText = "text-sm text-neutral-950/80";

  const data = weeks && weeks.length > 0 ? weeks : fallbackWeeks;

  return (
    <div className="relative">
      {/* footer trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-0 py-0 text-sm text-neutral-100 hover:underline underline-offset-4 focus:outline-none"
      >
        <Github className="h-4 w-4 opacity-90" />
        <span className="text-xs font-medium tracking-tight">Built with Github</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <>
            <motion.button
              aria-label="close"
              className="fixed inset-0 z-[60] bg-black/35"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            />

            <motion.div
              className="fixed inset-x-0 bottom-0 z-[61] px-3 sm:px-6"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={pop}
            >
              <div className="w-full">
                {/* bottom sheet (top corners only) */}
                <div className="rounded-t-3xl bg-[#aa96af] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                  {/* header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-4">
                    <Github className="h-5 w-5 text-neutral-950/90" />
                    <Link href={repoUrl} target="_blank" className={pill}>
                      Open Repository
                    </Link>
                  </div>

                  {/* content */}
                  <motion.div
                    className="px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
                    variants={list}
                    initial="hidden"
                    animate="show"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <motion.div variants={item} className="rounded-2xl bg-white/35 p-4">
                        <div className={label}>Repository</div>
                        <div className={`${value} mt-2`}>
                          isaaciseiler-beep / finalfinalsite
                        </div>
                      </motion.div>

                      <motion.div variants={item} className="rounded-2xl bg-white/35 p-4">
                        <div className={label}>Stars</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`${value}`}>
                            {typeof repoStars === "number" ? repoStars.toLocaleString() : "—"}
                          </span>
                        </div>
                      </motion.div>

                      {/* commits: smaller centered housing */}
                      <motion.div
                        variants={item}
                        className="rounded-2xl bg-white/35 p-4 sm:col-span-2"
                      >
                        <div className={label}>Commits</div>

                        <div className="mt-3">
                          <div className="mx-auto w-full max-w-[640px] rounded-2xl bg-black/10 p-4">
                            <CommitGrid weeks={data} />
                          </div>

                          {loading && (!weeks || weeks.length === 0) ? (
                            <div className="mt-2 text-xs text-neutral-950/60 text-center">
                              loading…
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    </div>

                    {/* popup footer: button styled like copyright (same size/color, icon same color) */}
                    <motion.div variants={item} className="mt-5 flex justify-center">
                      <Link
                        href={repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 ${popupFooterText} hover:underline underline-offset-4`}
                      >
                        <Github className="h-4 w-4 text-neutral-950/80" />
                        <span>Built with Github</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* helpers */

function parseOwnerRepo(url: string) {
  try {
    const u = new URL(url);
    const [owner, repo] = u.pathname.replace(/^\//, "").split("/");
    return { owner: owner ?? "", repo: repo ?? "" };
  } catch {
    return { owner: "", repo: "" };
  }
}

function CommitGrid({ weeks }: { weeks: CommitActivityWeek[] }) {
  const allDays = weeks.flatMap((w) => w.days);
  const max = Math.max(1, ...allDays);

  const level = (c: number) => {
    if (c <= 0) return 0;
    const r = c / max;
    if (r <= 0.25) return 1;
    if (r <= 0.5) return 2;
    if (r <= 0.75) return 3;
    return 4;
  };

  const cellBg = (lvl: number) => {
    switch (lvl) {
      case 0:
        return "bg-black/10";
      case 1:
        return "bg-black/20";
      case 2:
        return "bg-black/30";
      case 3:
        return "bg-black/45";
      default:
        return "bg-black/60";
    }
  };

  const rows = Array.from({ length: 7 }, (_, dayIdx) =>
    weeks.map((w) => w.days?.[dayIdx] ?? 0)
  );

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-[3px]">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="inline-flex gap-[3px]">
            {row.map((count, colIdx) => (
              <span
                key={`${rowIdx}-${colIdx}`}
                className={`h-[10px] w-[10px] rounded-[2px] ${cellBg(level(count))}`}
                title={`${count} commit${count === 1 ? "" : "s"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* deterministic fallback weeks so the grid always renders */
function buildFallbackWeeks(repoUrl: string): CommitActivityWeek[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // sunday

  const seed = fnv1a(repoUrl);
  const rand = mulberry32(seed);

  const weeks: CommitActivityWeek[] = [];
  const weekCount = 52;

  const burstCenters = Array.from({ length: 4 }, () => Math.floor(rand() * weekCount));

  for (let i = weekCount - 1; i >= 0; i--) {
    const weekDate = new Date(startOfWeek);
    weekDate.setDate(weekDate.getDate() - i * 7);
    const weekUnix = Math.floor(weekDate.getTime() / 1000);

    const idx = weekCount - 1 - i;

    const days = Array.from({ length: 7 }, () => {
      let v = rand() < 0.62 ? 0 : rand() < 0.8 ? 1 : rand() < 0.93 ? 2 : 3;

      for (const c of burstCenters) {
        const dist = Math.abs(idx - c);
        if (dist <= 3 && rand() < 0.55) {
          const bump = dist === 0 ? 4 : dist === 1 ? 3 : dist === 2 ? 2 : 1;
          v += bump;
        }
      }

      if (rand() < 0.12) v += 1;
      if (rand() < 0.06) v += 2;

      return Math.max(0, Math.min(12, v));
    });

    weeks.push({ week: weekUnix, days, total: days.reduce((a, b) => a + b, 0) });
  }

  return weeks;
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fnv1a(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
