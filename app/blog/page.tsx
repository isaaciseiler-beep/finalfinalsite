// app/blog/page.tsx  ← REPLACE
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";
import MainContainer from "@/components/MainContainer";
import Reveal from "@/components/Reveal";

type PostMeta = {
  title: string;
  date: string; // yyyy-mm-dd
  image?: string;
  summary?: string;
  tags?: string[];
};

type PostListItem = {
  slug: string;
  meta: PostMeta;
  excerpt: string;
  minutes: number;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const EXCERPT_MAX_CHARS = 200;
const MAX_TAGS = 4;
const PRIORITY_IMAGES = 2;

// strip any leading comment/blank lines before front-matter
function sanitizeForMatter(src: string) {
  const lines = src.split(/\r?\n/);
  while (lines.length && (/^\s*$/.test(lines[0]) || /^\s*\/\//.test(lines[0]))) lines.shift();
  return lines.join("\n");
}

// date-only strings can shift with timezone; parse as local midnight
function parseLocalDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function dateValue(date: string) {
  const t = parseLocalDate(date).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function formatDate(date: string) {
  const d = parseLocalDate(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

function toStr(v: unknown) {
  return typeof v === "string" ? v : undefined;
}

function toStrArr(v: unknown) {
  if (!Array.isArray(v)) return undefined;
  const out = v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
  return out.length ? out : undefined;
}

function normalizeMeta(data: unknown): Partial<PostMeta> {
  const d = (data ?? {}) as Record<string, unknown>;
  return {
    title: toStr(d.title),
    date: toStr(d.date),
    image: toStr(d.image),
    summary: toStr(d.summary),
    tags: toStrArr(d.tags),
  };
}

function hashToHue(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) % 360;
  return h;
}

function coverFallbackStyle(slug: string) {
  const hue = hashToHue(slug);
  const hue2 = (hue + 44) % 360;
  const hue3 = (hue + 18) % 360;

  const c1 = `hsla(${hue}, 78%, 54%, 0.62)`;
  const c2 = `hsla(${hue2}, 62%, 16%, 0.96)`;
  const glow = `hsla(${hue3}, 88%, 62%, 0.22)`;

  // “pro” fallback: glow + subtle texture + deep gradient
  return {
    backgroundImage: [
      `radial-gradient(75% 55% at 18% 16%, ${glow} 0%, transparent 62%)`,
      `radial-gradient(55% 45% at 82% 32%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
      `repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 12px)`,
      `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
    ].join(", "),
  } as const;
}

function stripToText(src: string) {
  let text = src || "";

  // drop mdx imports/exports
  text = text
    .split(/\r?\n/)
    .filter((line) => !/^\s*(import|export)\s+/.test(line))
    .join("\n");

  // remove fenced code blocks
  text = text.replace(/```[\s\S]*?```/g, " ");

  // remove html/jsx tags
  text = text.replace(/<\/?[^>]+>/g, " ");

  // images: ![alt](url)
  text = text.replace(/!\[[^\]]*]\([^)]*\)/g, " ");

  // links: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // inline code
  text = text.replace(/`[^`]*`/g, " ");

  // headings / blockquotes / list markers
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^\s*>\s+/gm, "");
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // emphasis / misc markdown tokens
  text = text.replace(/[*_~]/g, " ");

  // collapse whitespace
  return text.replace(/\s+/g, " ").trim();
}

function createExcerpt(src: string, maxLen = EXCERPT_MAX_CHARS) {
  const text = stripToText(src);
  if (!text) return "";
  if (text.length <= maxLen) return text;

  const slice = text.slice(0, maxLen + 1);
  const lastStop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastStop > Math.floor(maxLen * 0.6)) return slice.slice(0, lastStop + 1).trim();

  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice.slice(0, maxLen)).trim() + "…";
}

function readingMinutes(content: string) {
  const words = stripToText(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function getPosts(): PostListItem[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .sort(); // deterministic order before date sort

  const items: PostListItem[] = [];

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const fullPath = path.join(BLOG_DIR, file);

    try {
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(sanitizeForMatter(raw));
      const metaPartial = normalizeMeta(data);

      if (!metaPartial.title || !metaPartial.date) continue;

      const tags = metaPartial.tags?.slice(0) ?? [];
      const excerpt = (metaPartial.summary?.trim() || createExcerpt(content)).trim();
      const minutes = readingMinutes(content);

      items.push({
        slug,
        meta: {
          title: metaPartial.title,
          date: metaPartial.date,
          image: metaPartial.image,
          summary: metaPartial.summary,
          tags,
        },
        excerpt,
        minutes,
      });
    } catch {
      // professional-grade behavior: one bad file should not take down the page/build
      continue;
    }
  }

  return items.sort((a, b) => dateValue(b.meta.date) - dateValue(a.meta.date));
}

// tuned “pinterest rhythm”: slightly horizontal rectangles + gentle offsets + staggered vertical start
const LAYOUT = [
  { aspect: "aspect-[16/10]", mt: "sm:mt-0", x: "sm:translate-x-0" },
  { aspect: "aspect-[3/2]", mt: "sm:mt-5", x: "sm:-translate-x-1" },
  { aspect: "aspect-[5/3]", mt: "sm:mt-2", x: "sm:translate-x-1" },
  { aspect: "aspect-[16/9]", mt: "sm:mt-7", x: "sm:translate-x-0" },
  { aspect: "aspect-[16/10]", mt: "sm:mt-3", x: "sm:-translate-x-2" },
  { aspect: "aspect-[3/2]", mt: "sm:mt-1", x: "sm:translate-x-2" },
];

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <MainContainer>
      <div className="mx-auto w-full max-w-[1120px]">
        <Reveal>
          <h1 className="text-[32px] sm:text-[38px] font-semibold leading-[1.05] tracking-tight text-white">
            blog
          </h1>
        </Reveal>

        <Reveal delayMs={80}>
          <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-neutral-300">
            image-first notes on building, shipping, and learning.
          </p>
        </Reveal>

        {posts.length === 0 ? (
          <div className="mt-8 text-sm text-neutral-400">
            no posts found in <code className="text-neutral-300">/content/blog</code>.
          </div>
        ) : (
          <div className="mt-9 columns-1 sm:columns-2 lg:columns-3 gap-x-6 [column-fill:_balance]">
            {posts.map(({ slug, meta, excerpt, minutes }, i) => {
              const dateStr = formatDate(meta.date);
              const layout = LAYOUT[i % LAYOUT.length];

              const tags = Array.isArray(meta.tags) ? meta.tags.filter(Boolean) : [];
              const shownTags = tags.slice(0, MAX_TAGS);

              return (
                <Reveal key={slug} delayMs={70 * i}>
                  <div className={`mb-6 break-inside-avoid ${layout.mt} ${layout.x}`}>
                    <Link
                      href={`/blog/${slug}`}
                      aria-label={`read: ${meta.title}`}
                      className={[
                        "group relative block overflow-hidden rounded-2xl",
                        "border border-neutral-800 bg-neutral-900/20",
                        "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_40px_rgba(0,0,0,0.35)]",
                        "transition-transform duration-300 motion-reduce:transition-none",
                        "hover:-translate-y-0.5 hover:border-neutral-700",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/70",
                      ].join(" ")}
                    >
                      <div className={`relative w-full ${layout.aspect}`}>
                        {meta.image ? (
                          <Image
                            src={meta.image}
                            alt={meta.title}
                            fill
                            className={[
                              "object-cover",
                              "transition-transform duration-500 motion-reduce:transition-none",
                              "group-hover:scale-[1.035]",
                            ].join(" ")}
                            sizes="(min-width:1024px) 360px, (min-width:640px) 46vw, 100vw"
                            priority={i < PRIORITY_IMAGES}
                          />
                        ) : (
                          <div className="absolute inset-0" style={coverFallbackStyle(slug)} aria-hidden />
                        )}

                        {/* soft vignette + contrast */}
                        <div
                          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"
                          aria-hidden
                        />

                        {/* bottom readability gradient */}
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-black/90 via-black/35 to-transparent"
                          aria-hidden
                        />

                        {/* content */}
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div
                            className={[
                              "rounded-xl bg-black/35 ring-1 ring-white/10",
                              "backdrop-blur-sm",
                              "px-3.5 py-3",
                              "transition-colors duration-300 motion-reduce:transition-none",
                              "group-hover:bg-black/40",
                            ].join(" ")}
                          >
                            <div className="flex items-center gap-2 text-[12px] font-medium text-neutral-200/80">
                              <span className="tabular-nums">{dateStr}</span>
                              <span className="text-neutral-400/70">•</span>
                              <span className="tabular-nums">{minutes} min read</span>
                            </div>

                            <div className="mt-1.5 line-clamp-2 text-[18px] sm:text-[19px] font-semibold leading-snug tracking-tight text-white">
                              {meta.title}
                            </div>

                            {excerpt ? (
                              <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-neutral-200/85">
                                {excerpt}
                              </p>
                            ) : null}

                            {shownTags.length ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {shownTags.map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[12px] text-neutral-200/80"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* hover sheen + inner ring */}
                        <div
                          className={[
                            "pointer-events-none absolute inset-0 opacity-0",
                            "transition-opacity duration-300 motion-reduce:transition-none",
                            "group-hover:opacity-100",
                          ].join(" ")}
                          aria-hidden
                        >
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                          <div className="absolute -inset-16 bg-gradient-to-r from-white/0 via-white/8 to-white/0 rotate-12 blur-2xl" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </MainContainer>
  );
}

