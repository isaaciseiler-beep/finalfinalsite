// app/blog/page.tsx  ← REPLACE
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";
import MainContainer from "@/components/MainContainer";
import Reveal from "@/components/Reveal";

type PostMeta = { title: string; date: string; image?: string; summary?: string; tags?: string[] };

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

// strip any leading comment/blank lines before front-matter
function sanitizeForMatter(src: string) {
  const lines = src.split(/\r?\n/);
  while (lines.length && (/^\s*$/.test(lines[0]) || /^\s*\/\//.test(lines[0]))) lines.shift();
  return lines.join("\n");
}

function getPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data } = matter(sanitizeForMatter(raw));
      return { slug, meta: data as Partial<PostMeta> };
    })
    .filter((p) => p.meta?.title && p.meta?.date)
    .sort((a, b) => Number(new Date(b.meta!.date!)) - Number(new Date(a.meta!.date!)));
}

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <MainContainer>
      <Reveal>
        <h1 className="text-[32px] font-medium leading-none text-white tracking-tight">Blog Posts</h1>
      </Reveal>

      {/* full-width rectangle cards */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        {posts.length === 0 ? (
          <div className="text-sm text-neutral-400">
            no posts found in <code className="text-neutral-300">/content/blog</code>.
          </div>
        ) : (
          posts.map(({ slug, meta }, i) => {
            const dateStr = meta?.date
              ? new Date(meta.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
              : "";

            return (
              <Reveal key={slug} delayMs={60 * i}>
                <Link
                  href={`/blog/${slug}`}
                  className="group block overflow-hidden border border-neutral-800 no-underline hover:border-neutral-700"
                >
                  {/* 16:9 rectangle that runs to the container edges */}
                  <div className="relative aspect-video w-full">
                    {meta?.image ? (
                      <Image
                        src={meta.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(min-width:1024px) 896px, (min-width:640px) 80vw, 100vw"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-900" />
                    )}

                    {/* bottom gradient 30% */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/90 to-transparent" />

                    {/* info pack bottom 25% */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                      <div className="min-h-[25%]">
                        <div className="text-[13px] text-neutral-300">{dateStr}</div>
                        <div className="mt-0.5 line-clamp-2 text-[20px] font-medium text-white">{meta?.title}</div>
                        {meta?.summary ? (
                          <div className="mt-0.5 line-clamp-2 text-[15px] text-neutral-300">{meta.summary}</div>
                        ) : null}
                        {meta?.tags?.length ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {meta.tags.slice(0, 6).map((t) => (
                              <span
                                key={t}
                                className="rounded-md border border-neutral-700/70 bg-black/30 px-1.5 py-0.5 text-[12px] text-neutral-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })
        )}
      </div>
    </MainContainer>
  );
}
