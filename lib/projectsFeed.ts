import fs from "fs/promises";
import path from "path";

export type EntryKind = "project" | "blog" | "article";

export type FeedEntry = {
  id: string;
  kind: EntryKind;
  kindLabel: string;
  slug: string;
  href: string;

  title: string;
  summary?: string;
  date?: string;
  tags?: string[];
  image?: string;
  pinned?: boolean;
  readingMinutes?: number;
};

type EntrySource = {
  kind: EntryKind;
  kindLabel: string;
  // allow multiple dirs for a kind (blog often lives in /blog or /posts)
  dirs: string[];
  hrefForSlug: (slug: string) => string;
};

const SOURCES: EntrySource[] = [
  {
    kind: "project",
    kindLabel: "Project",
    dirs: ["projects"],
    hrefForSlug: (slug) => `/projects/${slug}`,
  },
  {
    kind: "blog",
    kindLabel: "Blog Post",
    dirs: ["blog", "posts"],
    hrefForSlug: (slug) => `/projects/blog/${slug}`,
  },
  {
    kind: "article",
    kindLabel: "Article",
    dirs: ["articles"],
    hrefForSlug: (slug) => `/projects/article/${slug}`,
  },
];

function contentDir(dirName: string) {
  return path.join(process.cwd(), "content", dirName);
}

async function safeReadDir(dir: string) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function safeReadFile(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export function splitFrontmatter(source: string): { data: Record<string, unknown>; content: string } {
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

export function estimateReadingMinutes(markdown: string) {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, " ");
  const words = withoutCode.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date?: string) {
  if (!date) return "undated";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(
    d,
  );
}

/* ---------- minimal markdown -> html (matches your existing style) ---------- */

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
  const codes: string[] = [];
  let s = raw.replace(/`([^`]+)`/g, (_m, code) => {
    const i = codes.push(escapeHtml(code)) - 1;
    return `@@CODE${i}@@`;
  });

  const links: string[] = [];
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, href) => {
    const safeText = escapeHtml(String(text));
    const safeHref = escapeAttr(String(href));
    const external = /^https?:\/\//.test(String(href));
    const attrs = external ? ` target="_blank" rel="noreferrer"` : "";
    const i = links.push(`<a href="${safeHref}"${attrs}>${safeText}</a>`) - 1;
    return `@@LINK${i}@@`;
  });

  s = escapeHtml(s);

  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>");

  s = s.replace(/@@LINK(\d+)@@/g, (_m, i) => links[Number(i)] ?? "");
  s = s.replace(/@@CODE(\d+)@@/g, (_m, i) => `<code>${codes[Number(i)] ?? ""}</code>`);

  return s;
}

export function markdownToHtml(markdown: string): string {
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
        out.push(`<pre><code${cls}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = false;
        codeLang = "";
        codeLines = [];
        continue;
      }
      codeLines.push(line);
      continue;
    }

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

    if (line.trim() === "") {
      flushPara();
      flushUl();
      flushOl();
      flushQuote();
      continue;
    }

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

    if (/^---+$/.test(line.trim())) {
      flushPara();
      flushUl();
      flushOl();
      flushQuote();
      out.push("<hr />");
      continue;
    }

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

    const ulm = line.match(/^\s*[-*]\s+(.+)$/);
    if (ulm) {
      flushPara();
      flushOl();
      ul = ul ?? [];
      ul.push(`<li>${renderInline(ulm[1].trim())}</li>`);
      continue;
    }

    const olm = line.match(/^\s*\d+\.\s+(.+)$/);
    if (olm) {
      flushPara();
      flushUl();
      ol = ol ?? [];
      ol.push(`<li>${renderInline(olm[1].trim())}</li>`);
      continue;
    }

    para.push(line.trim());
  }

  flushPara();
  flushUl();
  flushOl();
  flushQuote();

  return out.join("\n");
}

/* ---------- feed + entry fetchers ---------- */

function normalizeImage(data: Record<string, unknown>) {
  const img = typeof data.image === "string" ? data.image : undefined;
  const cover = typeof data.cover === "string" ? data.cover : undefined;
  return img ?? cover;
}

export async function getFeedEntries(): Promise<FeedEntry[]> {
  const all: FeedEntry[] = [];

  for (const src of SOURCES) {
    for (const dirName of src.dirs) {
      const dir = contentDir(dirName);
      const entries = await safeReadDir(dir);

      const mdxFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".mdx"));
      for (const e of mdxFiles) {
        const slug = e.name.replace(/\.mdx$/, "");
        const raw = await safeReadFile(path.join(dir, e.name));
        if (!raw) continue;

        const { data, content } = splitFrontmatter(raw);

        const title = typeof data.title === "string" ? data.title : slug.replace(/-/g, " ");
        const summary = typeof data.summary === "string" ? data.summary : undefined;
        const date = typeof data.date === "string" ? data.date : undefined;
        const pinned = typeof data.pinned === "boolean" ? data.pinned : false;
        const tags = Array.isArray(data.tags)
          ? data.tags.filter((t) => typeof t === "string").map(String)
          : undefined;

        const image = normalizeImage(data);
        const readingMinutes = estimateReadingMinutes(content);

        all.push({
          id: `${src.kind}:${dirName}:${slug}`,
          kind: src.kind,
          kindLabel: src.kindLabel,
          slug,
          href: src.hrefForSlug(slug),
          title,
          summary,
          date,
          tags,
          image,
          pinned,
          readingMinutes,
        });
      }
    }
  }

  // Keep only entries with a title (summary optional for this new card UI)
  return all
    .filter((x) => Boolean(x.title))
    .sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (ap !== bp) return bp - ap;

      const ad = a.date ? new Date(a.date).getTime() : 0;
      const bd = b.date ? new Date(b.date).getTime() : 0;
      if (ad !== bd) return bd - ad;

      return a.title.localeCompare(b.title);
    });
}

export async function getSlugs(kind: EntryKind): Promise<string[]> {
  const src = SOURCES.find((s) => s.kind === kind);
  if (!src) return [];

  const slugs: string[] = [];
  for (const dirName of src.dirs) {
    const dir = contentDir(dirName);
    const entries = await safeReadDir(dir);
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith(".mdx")) slugs.push(e.name.replace(/\.mdx$/, ""));
    }
  }
  return Array.from(new Set(slugs));
}

export async function getEntry(kind: EntryKind, slug: string): Promise<{
  meta: FeedEntry;
  content: string;
  html: string;
} | null> {
  const src = SOURCES.find((s) => s.kind === kind);
  if (!src) return null;

  for (const dirName of src.dirs) {
    const file = path.join(contentDir(dirName), `${slug}.mdx`);
    const raw = await safeReadFile(file);
    if (!raw) continue;

    const { data, content } = splitFrontmatter(raw);

    const title = typeof data.title === "string" ? data.title : slug.replace(/-/g, " ");
    const summary = typeof data.summary === "string" ? data.summary : undefined;
    const date = typeof data.date === "string" ? data.date : undefined;
    const pinned = typeof data.pinned === "boolean" ? data.pinned : false;
    const tags = Array.isArray(data.tags)
      ? data.tags.filter((t) => typeof t === "string").map(String)
      : undefined;

    const image = normalizeImage(data);
    const readingMinutes = estimateReadingMinutes(content);
    const html = markdownToHtml(content);

    return {
      meta: {
        id: `${src.kind}:${dirName}:${slug}`,
        kind: src.kind,
        kindLabel: src.kindLabel,
        slug,
        href: src.hrefForSlug(slug),
        title,
        summary,
        date,
        tags,
        image,
        pinned,
        readingMinutes,
      },
      content,
      html,
    };
  }

  return null;
}
