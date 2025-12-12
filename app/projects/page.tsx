import Link from "next/link";
import Container from "@/components/Container";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-static";

type ProjectMeta = {
  slug: string;
  title: string;
  summary: string;
  date?: string;
  status?: string;
  tags?: string[];
  emoji?: string;
  pinned?: boolean;
  readingMinutes?: number;
};

function projectsDir() {
  return path.join(process.cwd(), "content", "projects");
}

function splitFrontmatter(source: string): { data: Record<string, unknown>; content: string } {
  const normalized = source.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return { data: {}, content: normalized };

  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) return { data: {}, content: normalized };

  const raw = normalized.slice(4, end);
  const content = normalized.slice(end + 5);

  const data: Record<string, unknown> = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;

    const idx = t.indexOf(":");
    if (idx === -1) continue;

    const key = t.slice(0, idx).trim();
    let value = t.slice(idx + 1).trim();

    // strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // arrays: [a, b, c]
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      const arr = inner
        ? inner
            .split(",")
            .map((s) => s.trim())
            .map((s) => {
              if (
                (s.startsWith('"') && s.endsWith('"')) ||
                (s.startsWith("'") && s.endsWith("'"))
              ) {
                return s.slice(1, -1);
              }
              return s;
            })
            .filter(Boolean)
        : [];
      data[key] = arr;
      continue;
    }

    if (value === "true" || value === "false") {
      data[key] = value === "true";
      continue;
    }

    // keep YYYY-MM-DD as string
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      data[key] = value;
      continue;
    }

    const asNum = Number(value);
    if (value !== "" && Number.isFinite(asNum)) {
      data[key] = asNum;
      continue;
    }

    data[key] = value;
  }

  return { data, content };
}

function estimateReadingMinutes(markdown: string) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, " ");
  const words = withoutCode.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function formatDate(date?: string) {
  if (!date) return "undated";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(
    d,
  );
}

async function getProjects(): Promise<ProjectMeta[]> {
  try {
    const dir = projectsDir();
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const items = await Promise.all(
      entries
        .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
        .map(async (e) => {
          const slug = e.name.replace(/\.mdx$/, "");
          const full = path.join(dir, e.name);
          const raw = await fs.readFile(full, "utf8");

          const { data, content } = splitFrontmatter(raw);

          const title = typeof data.title === "string" ? data.title : slug.replace(/-/g, " ");
          const summary = typeof data.summary === "string" ? data.summary : "";
          const date = typeof data.date === "string" ? data.date : undefined;
          const status = typeof data.status === "string" ? data.status : undefined;
          const emoji = typeof data.emoji === "string" ? data.emoji : undefined;
          const pinned = typeof data.pinned === "boolean" ? data.pinned : false;
          const tags = Array.isArray(data.tags)
            ? data.tags.filter((t) => typeof t === "string")?.map(String)
            : undefined;

          const readingMinutes = estimateReadingMinutes(content);

          return {
            slug,
            title,
            summary,
            date,
            status,
            tags,
            emoji,
            pinned,
            readingMinutes,
          } satisfies ProjectMeta;
        }),
    );

    return items
      .filter((p) => p.title && p.summary)
      .sort((a, b) => {
        const ap = a.pinned ? 1 : 0;
        const bp = b.pinned ? 1 : 0;
        if (ap !== bp) return bp - ap;

        const ad = a.date ? new Date(a.date).getTime() : 0;
        const bd = b.date ? new Date(b.date).getTime() : 0;
        if (ad !== bd) return bd - ad;

        return a.title.localeCompare(b.title);
      });
  } catch {
    return [];
  }
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-mutefg">
      {children}
    </span>
  );
}

export default async function Projects() {
  const all = await getProjects();
  const pinned = all.filter((p) => p.pinned);
  const feed = all.filter((p) => !p.pinned);

  return (
    <Container>
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">projects</h1>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-mutefg">
          A running feed of shipped work, experiments, and operational tooling — written as compact,
          blog-style case studies.
        </p>
      </header>

      {pinned.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 text-xs uppercase tracking-wide text-mutefg">pinned</div>
          <div className="grid gap-4 md:grid-cols-2">
            {pinned.map((p) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="card group block p-6 no-underline transition hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-base">
                    {p.emoji ?? "✦"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg md:text-xl font-medium leading-tight">{p.title}</div>
                      <Badge>pinned</Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-mutefg">
                      <time dateTime={p.date}>{formatDate(p.date)}</time>
                      {p.status && <Badge>{p.status}</Badge>}
                      <Badge>{p.readingMinutes} min read</Badge>
                    </div>

                    <p className="mt-3 text-sm md:text-base text-mutefg">{p.summary}</p>

                    {p.tags && p.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.tags.slice(0, 5).map((t) => (
                          <Badge key={t}>#{t}</Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 inline-flex items-center gap-1 text-sm">
                      <span className="underline decoration-white/20 underline-offset-4 group-hover:decoration-white/40">
                        read the post
                      </span>
                      <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section>
          <ol className="relative border-l border-white/10 pl-6">
            {feed.map((p) => (
              <li key={p.slug} className="relative pb-6 last:pb-0">
                <span className="absolute -left-[7px] top-7 h-3 w-3 rounded-full border border-white/20 bg-white/10" />
                <Link
                  href={`/projects/${p.slug}`}
                  className="card group block p-6 no-underline transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-base">
                      {p.emoji ?? "•"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-mutefg">
                        <time dateTime={p.date}>{formatDate(p.date)}</time>
                        {p.status && <Badge>{p.status}</Badge>}
                        <Badge>{p.readingMinutes} min</Badge>
                      </div>

                      <div className="mt-2 text-lg font-medium leading-tight">{p.title}</div>
                      <p className="mt-2 text-sm md:text-base text-mutefg">{p.summary}</p>

                      {p.tags && p.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {p.tags.slice(0, 4).map((t) => (
                            <Badge key={t}>#{t}</Badge>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 inline-flex items-center gap-1 text-sm">
                        <span className="underline decoration-white/20 underline-offset-4 group-hover:decoration-white/40">
                          open
                        </span>
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          {all.length === 0 && (
            <div className="card p-6 text-sm text-mutefg">
              No projects found. Add MDX files under <code>content/projects</code>.
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="card p-6">
            <div className="text-sm font-medium">how to read this feed</div>
            <ul className="mt-3 space-y-2 text-sm text-mutefg">
              <li>Each tile links to a short case study: problem → approach → outcome.</li>
              <li>Tags show what the work focused on (systems, UX, automation, eval, etc.).</li>
              <li>Posts prioritize concrete decisions and tradeoffs over hype.</li>
            </ul>
          </div>

          <div className="card p-6">
            <div className="text-sm font-medium">writing style</div>
            <p className="mt-3 text-sm text-mutefg">
              I write these like internal launch notes: what changed, why it matters, what broke,
              and what I’d do next.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}

