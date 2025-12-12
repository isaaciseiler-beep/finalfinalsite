import Link from "next/link";
import Container from "@/components/Container";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-static";

type ProjectMeta = {
  slug: string;
  title: string;
  summary?: string;
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

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

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

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(s: string) {
  return escapeHtml(s);
}

function renderInline(raw: string): string {
  // 1) extract code spans
  const codes: string[] = [];
  let s = raw.replace(/`([^`]+)`/g, (_m, code) => {
    const i = codes.push(escapeHtml(code)) - 1;
    return `@@CODE${i}@@`;
  });

  // 2) extract links
  const links: string[] = [];
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
    const safeText = escapeHtml(String(text));
    const safeHref = escapeAttr(String(href));
    const external = /^https?:\/\//.test(String(href));
    const attrs = external ? ` target="_blank" rel="noreferrer"` : "";
    const i = links.push(`<a href="${safeHref}"${attrs}>${safeText}</a>`) - 1;
    return `@@LINK${i}@@`;
  });

  // 3) escape the rest
  s = escapeHtml(s);

  // 4) emphasis
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>");

  // 5) restore links + code
  s = s.replace(/@@LINK(\d+)@@/g, (_m, i) => links[Number(i)] ?? "");
  s = s.replace(/@@CODE(\d+)@@/g, (_m, i) => `<code>${codes[Number(i)] ?? ""}</code>`);

  return s;
}

function markdownToHtml(markdown: string): string {
  const src = markdown.replace(/\r\n/g, "\n");
  const lines = src.split("\n");

  const out: string[] = [];
  let para: string[] = [];
  let ul: string[] | null = null;
  let ol: string[] | null = null;
  let quote: string[] | null = null;

  let inCode = false;
  let codeLang = "";
  let codeLines: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(" ").trim();
    if (text) out.push(`<p>${renderInline(text)}</p>`);
    para = [];
  };

  const flushUl = () => {
    if (!ul || ul.length === 0) {
      ul = null;
      return;
    }
    out.push(`<ul>${ul.join("")}</ul>`);
    ul = null;
  };

  const flushOl = () => {
    if (!ol || ol.length === 0) {
      ol = null;
      return;
    }
    out.push(`<ol>${ol.join("")}</ol>`);
    ol = null;
  };

  const flushQuote = () => {
    if (!quote || quote.length === 0) {
      quote = null;
      return;
    }
    out.push(`<blockquote><p>${quote.join("<br />")}</p></blockquote>`);
    quote = null;
  };

  for (const rawLine of lines) {
    const line = rawLine ?? "";

    if (inCode) {
      if (line.trim().startsWith("```")) {
        const cls = codeLang ? ` class="language-${escapeAttr(codeLang)}"` : "";
        out.push(
          `<pre><code${cls}>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
        );
        inCode = false;
        codeLang = "";
        codeLines = [];
        continue;
      }
      codeLines.push(line);
      continue;
    }

    // code fence open
    if (line.trim().startsWith("```")) {
      flushPara();
      flushUl();
      flushOl();
      flushQuote();
      inCode = true;
      codeLang = line.trim().slice(3).trim();
      codeLines = [];
      continue;
    }

    // blank line
    if (line.trim() === "") {
      flushPara();
      flushUl();
      flushOl();
      flushQuote();
      continue;
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flushPara();
      flushUl();
      flushOl();
      flushQuote();
      const level = h[1].length;
      out.push(`<h${level}>${renderInline(h[2].trim())}</h${level}>`);
      continue;
    }

    // hr
    if (/^---+$/.test(line.trim())) {
      flushPara();
      flushUl();
      flushOl();
      flushQuote();
      out.push("<hr />");
      continue;
    }

    // blockquote
    const bq = line.match(/^>\s?(.*)$/);
    if (bq) {
      flushPara();
      flushUl();
      flushOl();
      quote = quote ?? [];
      quote.push(renderInline((bq[1] ?? "").trim()));
      continue;
    } else {
      flushQuote();
    }

    // ul
    const ulm = line.match(/^\s*[-*]\s+(.+)$/);
    if (ulm) {
      flushPara();
      flushOl();
      ul = ul ?? [];
      ul.push(`<li>${renderInline(ulm[1].trim())}</li>`);
      continue;
    }

    // ol
    const olm = line.match(/^\s*\d+\.\s+(.+)$/);
    if (olm) {
      flushPara();
      flushUl();
      ol = ol ?? [];
      ol.push(`<li>${renderInline(olm[1].trim())}</li>`);
      continue;
    }

    // paragraph continuation
    para.push(line.trim());
  }

  flushPara();
  flushUl();
  flushOl();
  flushQuote();

  return out.join("\n");
}

async function getAllProjects(): Promise<ProjectMeta[]> {
  try {
    const dir = projectsDir();
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const items = await Promise.all(
      entries
        .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
        .map(async (e) => {
          const slug = e.name.replace(/\.mdx$/, "");
          const raw = await fs.readFile(path.join(dir, e.name), "utf8");
          const { data, content } = splitFrontmatter(raw);

          const title = typeof data.title === "string" ? data.title : slug.replace(/-/g, " ");
          const summary = typeof data.summary === "string" ? data.summary : undefined;
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

    return items.sort((a, b) => {
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

export async function generateStaticParams() {
  try {
    const dir = projectsDir();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
      .map((e) => ({ slug: e.name.replace(/\.mdx$/, "") }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const raw = await fs.readFile(path.join(projectsDir(), `${params.slug}.mdx`), "utf8");
    const { data } = splitFrontmatter(raw);
    const title = typeof data.title === "string" ? data.title : params.slug;
    const summary = typeof data.summary === "string" ? data.summary : undefined;

    return {
      title,
      description: summary,
    };
  } catch {
    return {};
  }
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs text-mutefg">
      {children}
    </span>
  );
}

export default async function Project({ params }: { params: { slug: string } }) {
  const file = path.join(projectsDir(), `${params.slug}.mdx`);

  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch {
    return notFound();
  }

  const { data, content } = splitFrontmatter(raw);

  const title =
    typeof data.title === "string" ? data.title : params.slug.replace(/-/g, " ");
  const summary = typeof data.summary === "string" ? data.summary : undefined;
  const date = typeof data.date === "string" ? data.date : undefined;
  const status = typeof data.status === "string" ? data.status : undefined;
  const emoji = typeof data.emoji === "string" ? data.emoji : undefined;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t) => typeof t === "string")?.map(String)
    : undefined;

  const readingMinutes = estimateReadingMinutes(content);
  const html = markdownToHtml(content);

  const all = await getAllProjects();
  const idx = all.findIndex((p) => p.slug === params.slug);
  const prev = idx >= 0 ? all[idx + 1] : undefined;
  const next = idx >= 0 ? all[idx - 1] : undefined;

  return (
    <Container>
      <div className="mb-8">
        <Link href="/projects" className="text-sm text-mutefg no-underline hover:underline">
          ← projects
        </Link>
      </div>

      <header className="mb-10">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-base">
            {emoji ?? "•"}
          </div>

          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            {summary && <p className="mt-3 max-w-3xl text-sm md:text-base text-mutefg">{summary}</p>}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge>
                <time dateTime={date}>{formatDate(date)}</time>
              </Badge>
              {status && <Badge>{status}</Badge>}
              <Badge>{readingMinutes} min read</Badge>
              {tags?.slice(0, 6).map((t) => (
                <Badge key={t}>#{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      </header>

      <article
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {(prev || next) && (
        <nav className="mt-12 grid gap-4 md:grid-cols-2">
          {next ? (
            <Link href={`/projects/${next.slug}`} className="card block p-6 no-underline hover:-translate-y-0.5 transition">
              <div className="text-xs text-mutefg">next</div>
              <div className="mt-1 font-medium">{next.title}</div>
              {next.summary && <p className="mt-2 text-sm text-mutefg">{next.summary}</p>}
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}

          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="card block p-6 no-underline hover:-translate-y-0.5 transition">
              <div className="text-xs text-mutefg">previous</div>
              <div className="mt-1 font-medium">{prev.title}</div>
              {prev.summary && <p className="mt-2 text-sm text-mutefg">{prev.summary}</p>}
            </Link>
          ) : (
            <div className="hidden md:block" />
          )}
        </nav>
      )}
    </Container>
  );
}
