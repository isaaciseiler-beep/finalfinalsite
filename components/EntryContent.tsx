import Image from "next/image";
import { formatDate } from "@/lib/projectsFeed";

type EntryMeta = {
  title: string;
  date?: string;
  kindLabel: string;
  image?: string;
  summary?: string;
};

function KindPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground">
      {children}
    </span>
  );
}

export default function EntryContent({
  meta,
  html,
}: {
  meta: EntryMeta;
  html: string;
}) {
  return (
    <article>
      <div className="relative aspect-[16/10] w-full bg-neutral-900">
        {meta.image ? (
          <Image
            src={meta.image}
            alt={meta.title}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-white/[0.06] to-white/[0.02]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <KindPill>{meta.kindLabel}</KindPill>
          <span className="text-xs text-mutefg">
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {meta.title}
        </h1>

        {meta.summary && (
          <p className="mt-3 text-sm text-mutefg sm:text-base">{meta.summary}</p>
        )}
      </div>

      <div className="px-5 pb-8 sm:px-6">
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </article>
  );
}
