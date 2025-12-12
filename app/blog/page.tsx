// app/blog/page.tsx  ← REPLACE
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Link from "next/link";
import MainContainer from "@/components/MainContainer";
import Reveal from "@/components/Reveal";

type PostMeta = {
  title: string;
  date: string;
  image?: string;
  summary?: string;
  tags?: string[];
};

type PostListItem = {
  slug: string;
  meta: PostMeta;
  excerpt: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// strip any leading comment/blank lines before front-matter
function sanitizeForMatter(src: string) {
  const lines = src.split(/\r?\n/);
  while (lines.length && (/^\s*$/.test(lines[0]) || /^\s*\/\//.test(lines[0]))) lines.shift();
  return lines.join("\n");
}

function formatDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(Number(d))) return date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function createExcerpt(src: string, maxLen = 220) {
  let text = src || "";

  // Drop leading MDX imports/exports (common in MDX files)
  text = text
    .split(/\r?\n/)
    .filter((line) => !/^\s*(import|export)\s+/.test(line))
    .join("\n");

  // Remove fenced code blocks
  text = text.replace(/```[\s\S]*?```/g, " ");

  // Remove HTML/JSX tags
  text = text.replace(/<\/?[^>]+>/g, " ");

  // Images: ![alt](url)
  text = text.replace(/!\[[^\]]*]\([^)]*\)/g, " ");

  // Links: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Inline code
  text = text.replace(/`[^`]*`/g, " ");

  // Headings / blockquotes / list markers
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/^\s*>\s+/gm, "");
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");

  // Emphasis / misc markdown tokens
  text = text.replace(/[*_~]/g, " ");

  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (!text) return "";

  if (text.length <= maxLen) return text;

  // Prefer cutting on a sentence boundary when possible
  const slice = text.slice(0, maxLen + 1);
  const lastPeriod = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastPeriod > Math.floor(maxLen * 0.6)) {
    return slice.slice(0, lastPeriod + 1).trim();
  }

  // Otherwise cut on a word boundary
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice.slice(0, maxLen)).trim() + "…";
}

function getPosts(): PostListItem[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = matter(sanitizeForMatter(raw));

      const meta = data as Partial<PostMeta>;
      const excerpt = (meta.summary?.trim() || createExcerpt(content)).trim();

      return { slug, meta, excerpt };
    })
    .filter((p): p is { slug: string; meta: PostMeta; excerpt: string } => Boolean(p.meta?.title && p.meta?.date))
    .sort((a, b) => Number(new Date(b.meta.date)) - Number(new Date(a.meta.date)));
}

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <MainContainer>
      <div className="mx-auto w-full max-w-[720px]">
        <Reveal>
          <h1 className="text-[34px] font-semibold leading-[1.05] text-white tracking-tight">Blog</h1>
        </Reveal>

        <div className="mt-3 text-[15px] leading-relaxed text-neutral-300">
          Writing about building, shipping, and learning in public.
        </div>

        <div className="mt-8 border-t border-neutral-800">
          {posts.length === 0 ? (
            <div className="pt-6 text-sm text-neutral-400">
              no posts found in <code className="text-neutral-300">/content/blog</code>.
            </div>
          ) : (
            posts.map(({ slug, meta, excerpt }, i) => (
              <Reveal key={slug} delayMs={50 * i}>
                <Link
                  href={`/blog/${slug}`}
                  className={[
                    "group block border-b border-neutral-800 py-6 no-underline",
                    "-mx-2 px-2 rounded-md",
                    "transition-colors hover:bg-neutral-900/30",
                  ].join(" ")}
                >
                  <div className="text-[13px] font-medium text-neutral-400">{formatDate(meta.date)}</div>

                  <div className="mt-2 text-[22px] sm:text-[26px] font-semibold leading-snug tracking-tight text-white group-hover:text-white">
                    {meta.title}
                  </div>

                  {excerpt ? (
                    <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-neutral-300">{excerpt}</p>
                  ) : null}
                </Link>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </MainContainer>
  );
}

