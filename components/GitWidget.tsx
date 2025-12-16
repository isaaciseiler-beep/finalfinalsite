// components/GitWidget.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Sparkles, Star } from "lucide-react";

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
  week: number; // unix timestamp (seconds)
  days: number[]; // 7 values, Sun..Sat
};

export default function GitWidget({ repoUrl, stars }: Props) {
  const [open, setOpen] = React.useState(false);

  const [repoStars, setRepoStars] = React.useState<number | undefined>(stars);
  const [weeks, setWeeks] = React.useState<CommitActivityWeek[] | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    // avoid network work until the sheet is opened
    if (!open) return;

    const { owner, repo } = parseOwnerRepo(repoUrl);
    if (!owner || !repo) return;

    let cancelled = false;
    let tries = 0;
    setLoading(true);

    const fetchRepo = async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!res.ok) return;
        const json = (await res.json()) as { stargazers_count?: number };
        if (!cancelled && typeof json?.stargazers_count === "number") {
          setRepoStars(json.stargazers_count);
        }
      } catch {
        // ignore
      }
    };

    const fetchCommitActivity = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`
        );

        // GitHub may return 202 while computing the stats.
        if (res.status === 202 && tries < 6) {
          tries += 1;
          setTimeout(fetchCommitActivity, 450);
          return;
        }

        if (!res.ok) {
          if (!cancelled) setWeeks([]);
          return;
        }

        const json = (await res.json()) as CommitActivityWeek[];
        if (!cancelled) setWeeks(Array.isArray(json) ? json : []);
      } catch {
        if (!cancelled) setWeeks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRepo();
    fetchCommitActivity();

    return () => {
      cancelled = true;
    };
  }, [open, repoUrl]);

  const label = "text-sm font-medium text-neutral-900/75";
  const value = "text-base sm:text-lg font-semibold leading-snug text-neutral-950";
  const pill =
    "inline-flex items-center justify-center rounded-full bg-black/20 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-black/25";

  return (
    <div className="relative">
      {/* footer trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex select-none items-center gap-2 px-0 py-0 text-sm text-neutral-100 hover:underline underline-offset-4 focus:outline-none"
      >
        <Github className="h-4 w-4 opacity-90" />
        <span className="text-xs font-medium tracking-tight">Built with Github</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <>
            <motion.button
              aria-label="close"
              className="fixed inset-0 z-[60] cursor-default bg-black/35"
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
              <div className="mx-auto w-full max-w-none">
                {/* bottom sheet (top corners only) */}
                <div className="relative overflow-hidden rounded-t-3xl bg-[#aa96af] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                  {/* header */}
                  <div className="relative flex items-center justify-between px-5 sm:px-6 pt-5 pb-4">
                    <Github className="h-5 w-5 text-neutral-950/90" />
                    <Link
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={pill}
                    >
                      Open Repository
                    </Link>
                  </div>

                  {/* content */}
                  <motion.div
                    className="relative px-5 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
                    variants={list}
                    initial="hidden"
                    animate="show"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {/* repo */}
                      <motion.div variants={item} className="rounded-2xl bg-white/35 p-4">
                        <div className={label}>Repository</div>
                        <div className={`${value} mt-2 break-words`}>
                          {prettyRepo(repoUrl) || "isaaciseiler-beep / finalfinalsite"}
                        </div>
                      </motion.div>

                      {/* engagement */}
                      <motion.div variants={item} className="rounded-2xl bg-white/35 p-4">
                        <div className={label}>Stars</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Star className="h-4 w-4 fill-current text-neutral-950/90" />
                          <span className={value}>
                            {typeof repoStars === "number" ? repoStars.toLocaleString() : "—"}
                          </span>
                        </div>
                      </motion.div>

                      {/* commit grid */}
                      <motion.div
                        variants={item}
                        className="rounded-2xl bg-white/35 p-4 sm:col-span-2"
                      >
                        <div className={label}>Commits</div>
                        <div className="mt-3">
                          <CommitGrid weeks={weeks} loading={loading} />
                        </div>
                      </motion.div>
                    </div>

                    {/* footer line */}
                    <motion.div
                      variants={item}
                      className="mt-5 flex items-center justify-center gap-4 text-sm text-neutral-950/80"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-neutral-950/90" />
                        <span>Built with GPT 5, GPT 5.1, and GPT 5.2</span>
                      </span>
                      <span className="opacity-50">•</span>
                      <span className="inline-flex items-center gap-2">
                        <img
                          src="https://cdn.simpleicons.org/vercel/000000"
                          alt="Vercel"
                          width={14}
                          height={14}
                          className="opacity-80"
                        />
                        <span>Launched with Vercel</span>
                      </span>
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
function prettyRepo(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/^\//, "").split("/");
    return parts.slice(0, 2).join(" / ");
  } catch {
    return url;
  }
}

function parseOwnerRepo(url: string) {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/^\//, "").split("/");
    const owner = parts?.[0];
    const repo = parts?.[1];
    return { owner, repo };
  } catch {
    return { owner: "", repo: "" };
  }
}

function CommitGrid({
  weeks,
  loading,
}: {
  weeks: CommitActivityWeek[] | null;
  loading: boolean;
}) {
  if (loading && !weeks) {
    return <div className="text-sm text-neutral-950/70">Loading…</div>;
  }

  if (!weeks || weeks.length === 0) {
    return (
      <div className="text-sm text-neutral-950/70">
        {loading ? "Loading…" : "No activity available"}
      </div>
    );
  }

  // GitHub returns weekly buckets with day arrays (Sun..Sat)
  const allDays = weeks.flatMap((w) => w.days);
  const max = Math.max(0, ...allDays);

  const level = (c: number) => {
    if (c <= 0) return 0;
    if (max <= 1) return 1;
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

  // build day rows (Sun..Sat), each row is week columns
  const rows = Array.from({ length: 7 }, (_, dayIdx) =>
    weeks.map((w) => w.days?.[dayIdx] ?? 0)
  );

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="inline-flex flex-col gap-[3px]">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="inline-flex gap-[3px]">
            {row.map((count, colIdx) => {
              const w = weeks[colIdx];
              const ts = (w?.week ?? 0) + rowIdx * 86400;
              const d = new Date(ts * 1000);
              const dateLabel = Number.isFinite(d.getTime())
                ? d.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";

              const countLabel = `${count} commit${count === 1 ? "" : "s"}`;
              const title = dateLabel ? `${countLabel} on ${dateLabel}` : countLabel;

              return (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${rowIdx}-${colIdx}`}
                  title={title}
                  className={`h-[10px] w-[10px] rounded-[2px] ${cellBg(level(count))}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
