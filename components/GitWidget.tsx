// components/GitWidget.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

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

  // hook-safe: always called
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
      } catch {
        // ignore
      }
    };

    const fetchCommitActivity = async () => {
      // github stats endpoint is flaky (202/403); we try briefly and then fall back.
      const started = Date.now();
      const timeoutMs = 6500;

      const poll = async (): Promise<void> => {
        if (cancelled) return;

        try {
          const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
            { cache: "no-store" }
          );

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
  const sub = "text-sm text-neutral-950/70";
  const footerText = "text-sm text-neutral-950/80";

  const showLive = !!weeks && weeks.length > 0;
  const commitData = showLive ? weeks! : fallbackWeeks;

  return (
    <div className="relative">
      {/* footer trigger (adds context) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 text-sm text-neutral-100 hover:underline underline-offset-4"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Github className="h-4 w-4 opacity-90" />
        <span className="text-xs font-medium tracking-tight">
          github · source & commits
        </span>
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
              role="dialog"
              aria-modal="true"
            >
              <div className="w-full">
                {/* bottom sheet (top corners only) */}
                <div className="rounded-t-3xl bg-[#aa96af] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                  {/* header with context */}
                  <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-neutral-950">
                        <Github className="h-5 w-5 opacity-90" />
                        <div className="text-sm font-semibold">source</div>
                      </div>
                      <div className={`mt-1 ${sub}`}>
                        repo link + recent commit activity (52 weeks)
                      </div>
                    </div>

                    <Link
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={pill}
                    >
                      Open Repository <ExternalLink className="ml-2 h-4 w-4 opacity-80" />
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
                      {/* repo */}
                      <motion.div variants={item} className="rounded-2xl bg-white/35 p-4">
                        <div className={label}>Repository</div>
                        <div className={`${value} mt-2`}>
                          isaaciseiler-beep / finalfinalsite
                        </div>
                        <div className="mt-2 text-sm text-neutral-950/65 break-words">
                          {stripTree(repoUrl)}
                        </div>
                      </motion.div>

                      {/* stars, but icon is OpenAI logo per request */}
                      <motion.div variants={item} className="rounded-2xl bg-white/35 p-4">
                        <div className={label}>Stars</div>
                        <div className="mt-2 flex items-center gap-2">
                          <OpenAIMark className="h-4 w-4 text-neutral-950/80" />
                          <span className={value}>
                            {typeof repoStars === "number" ? repoStars.toLocaleString() : "—"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-neutral-950/65">
                          github stargazers count
                        </div>
                      </motion.div>

                      {/* commits (wide layout that makes sense on long windows) */}
                      <motion.div
                        variants={item}
                        className="rounded-2xl bg-white/35 p-4 sm:col-span-2"
                      >
                        <div className={label}>Commits</div>

                        <div className="mt-3 grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
                          {/* grid stays natural width; scroll if needed */}
                          <div className="max-w-full overflow-x-auto">
                            <CommitGrid weeks={commitData} />
                          </div>

                          {/* fills the “extra” width on long sheets */}
                          <div className="rounded-2xl bg-black/10 p-4 text-sm text-neutral-950/75">
                            <div className="font-medium text-neutral-950/85">
                              about this grid
                            </div>
                            <ul className="mt-2 space-y-1">
                              <li>shows 52 weeks (sunday–saturday)</li>
                              <li>darker = more commits</li>
                              <li>
                                {showLive
                                  ? "live github stats loaded"
                                  : loading
                                  ? "github stats still computing; showing fallback"
                                  : "github api unavailable; showing fallback"}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* footer */}
                    <motion.div
                      variants={item}
                      className={`mt-5 flex items-center justify-center gap-3 ${footerText}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex h-4 w-4 items-center justify-center text-neutral-950/80">
                          <SparkleDot />
                        </span>
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

function stripTree(url: string) {
  try {
    const u = new URL(url);
    return `https://github.com${u.pathname.replace(/\/tree\/.+$/, "")}`;
  } catch {
    return url;
  }
}

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
  );
}

/**
 * openai “logo” mark: uses simpleicons (with fallback text if it fails)
 * (your prior openai icon intermittently failed; this degrades gracefully)
 */
function OpenAIMark({ className }: { className?: string }) {
  const [ok, setOk] = React.useState(true);

  if (!ok) {
    return (
      <span className={className} aria-label="OpenAI">
        AI
      </span>
    );
  }

  return (
    <img
      src="https://cdn.simpleicons.org/openai/000000"
      alt="OpenAI"
      width={16}
      height={16}
      className={className}
      onError={() => setOk(false)}
    />
  );
}

function SparkleDot() {
  // small neutral glyph; inherits currentColor
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.2 5.2L18 9l-4.8 1.8L12 16l-1.2-5.2L6 9l4.8-1.8L12 2z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

/* deterministic fallback weeks (always renders) */
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
