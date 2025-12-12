// components/GitWidget.tsx  ← REPLACE
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Star, ExternalLink } from "lucide-react";

type Props = {
  repoUrl: string;
  branch?: string;
  stars?: number;
  footerSelector?: string;
};

const spring = { type: "spring", stiffness: 230, damping: 28, mass: 1 };
const fade = { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] };
const list = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] } } };

export default function GitWidget({ repoUrl, branch = "main", stars }: Props) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const label = "text-[11px] uppercase tracking-wide text-neutral-300";
  const value = "text-base sm:text-lg font-medium leading-tight text-neutral-100";
  const pill =
    "rounded-xl bg-neutral-900/70 px-3 py-2 text-xs text-neutral-100 hover:bg-neutral-900/85";

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
              className="fixed inset-x-0 bottom-0 z-[61] mx-0 w-full"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={spring}
            >
              {/* flush popup */}
              <div className="relative overflow-hidden rounded-none bg-neutral-950/85 backdrop-blur-md">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(189,170,194,0.92) 0%, rgba(189,170,194,0.55) 38%, rgba(189,170,194,0.22) 70%, rgba(189,170,194,0.10) 85%, rgba(189,170,194,0.00) 100%)",
                  }}
                />

                {/* header */}
                <div className="relative flex items-center justify-between px-6 sm:px-8 pt-6 pb-4">
                  <Github className="h-5 w-5 text-neutral-100 opacity-90" />
                  <Link
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-neutral-100 underline-offset-2 hover:underline"
                  >
                    open repo <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* content */}
                <motion.div
                  className="relative px-6 sm:px-8 pb-4 sm:pb-6"
                  variants={list}
                  initial="hidden"
                  animate="show"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* repo */}
                    <motion.div
                      variants={item}
                      className="rounded-2xl ring-1 ring-white/10 bg-neutral-900/60 p-4"
                    >
                      <div className={label}>repository</div>
                      <div className={`${value} mt-1 break-words`}>
                        {prettyRepo(repoUrl)}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <Link
                          href={`${repoUrl}/tree/${encodeURIComponent(branch)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          view branch
                        </Link>
                        <Link
                          href={`${repoUrl}/commits/${encodeURIComponent(branch)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          commits
                        </Link>
                      </div>
                    </motion.div>

                    {/* branch */}
                    <motion.div
                      variants={item}
                      className="rounded-2xl ring-1 ring-white/10 bg-neutral-900/60 p-4"
                    >
                      <div className={label}>branch</div>
                      <div className={`${value} mt-1`}>{branch}</div>
                      <div className="mt-3">
                        <Link
                          href={`${repoUrl}/compare/${encodeURIComponent(
                            branch
                          )}...main`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          compare to main
                        </Link>
                      </div>
                    </motion.div>

                    {/* engagement */}
                    <motion.div
                      variants={item}
                      className="rounded-2xl ring-1 ring-white/10 bg-neutral-900/60 p-4"
                    >
                      <div className={label}>engagement</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Star className="h-4 w-4 fill-current text-neutral-100" />
                        <span className={value}>
                          {typeof stars === "number" ? stars.toLocaleString() : "—"}
                        </span>
                        <span className="ml-2 text-xs text-neutral-300">stars</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <Link
                          href={`${repoUrl}/stargazers`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          stargazers
                        </Link>
                        <Link
                          href={`${repoUrl}/issues`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          issues
                        </Link>
                        <Link
                          href={`${repoUrl}/pulls`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          pull requests
                        </Link>
                      </div>
                    </motion.div>

                    {/* credits & inspirations */}
                    <motion.div
                      variants={item}
                      className="rounded-2xl ring-1 ring-white/10 bg-neutral-900/60 p-4"
                    >
                      <div className={label}>credits & inspirations</div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        <Link
                          href="https://osmo.supply"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          osmo.supply
                        </Link>
                        <Link
                          href="https://openai.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={pill}
                        >
                          openai.com
                        </Link>
                      </div>
                    </motion.div>
                  </div>

                  {/* footer line */}
                  <motion.div
                    variants={item}
                    className="mt-6 mb-2 flex items-center justify-center gap-4 text-[12px] text-neutral-300"
                  >
                    <span className="inline-flex items-center gap-2">
                      <img
                        src="https://cdn.simpleicons.org/openai/ffffff"
                        alt="OpenAI"
                        width={16}
                        height={16}
                        className="opacity-90"
                      />
                      <span>Built with GPT-5</span>
                    </span>
                    <span className="opacity-50">•</span>
                    <span className="inline-flex items-center gap-2">
                      <img
                        src="https://cdn.simpleicons.org/vercel/ffffff"
                        alt="Vercel"
                        width={14}
                        height={14}
                        className="opacity-90"
                      />
                      <span>Launched with Vercel.</span>
                    </span>
                  </motion.div>
                </motion.div>
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
