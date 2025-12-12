// app/blog/[slug]/page.tsx  ← REPLACE (wrap hero + body with Reveal)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import Image from "next/image";
import MainContainer from "@/components/MainContainer";
import Reveal from "@/components/Reveal";

type Meta = { title?: string; date?: string; image?: string; summary?: string; tags?: string[] };

export function generateStaticParams() {
  const BLOG_DIR = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".mdx")).map(f => ({ slug: f.replace(/\.mdx$/, "") }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), "content", "blog", `${params.slug}.mdx`);
  if (!fs.existsSync(filePath)) return {};
  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  const m = data as Meta;
  return { title: m.title, description: m.summary, openGraph: { title: m.title, description: m.summary, images: m.image ? [{ url: m.image }] : undefined } };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), "content", "blog", `${params.slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const { data } = matter(fs.readFileSync(filePath, "utf8"));
  const meta = data as Meta;
  const Mod = (await import(`@/content/blog/${params.slug}.mdx`)).default as React.ComponentType<any>;

  const dateStr = meta.date ? new Date(meta.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : "";

  return (
    <MainContainer>
      <Reveal>
        <div className="relative mb-6 w-full">
          <div className="relative h-[48vh] min-h-64 w-full">
            {meta.image ? (
              <Image src={meta.image} alt="" fill className="object-cover" priority sizes="100vw" />
            ) : (
              <div className="absolute inset-0 bg-neutral-900" />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-black/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="w-full">
                {dateStr && <div className="text-xs text-neutral-300">{dateStr}</div>}
                <h1 className="mt-0.5 text-[42px] font-medium leading-none text-white">{meta.title}</h1>
                {meta.summary ? <p className="mt-1 text-base text-neutral-300">{meta.summary}</p> : null}
                {meta.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {meta.tags.map((t) => (
                      <span key={t} className="rounded-md border border-neutral-700/70 bg-black/30 px-2 py-0.5 text-[12px] text-neutral-300">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delayMs={120}>
        <article className="prose prose-invert max-w-none w-full">
          <Mod />
        </article>
      </Reveal>
    </MainContainer>
  );
}
