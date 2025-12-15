import Link from "next/link";
import Container from "@/components/Container";
import { notFound } from "next/navigation";
import EntryContent from "@/components/EntryContent";
import { getEntry, getSlugs } from "@/lib/projectsFeed";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getSlugs("article");
  return slugs.map((slug) => ({ slug }));
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const entry = await getEntry("article", params.slug);
  if (!entry) return notFound();

  return (
    <Container>
      <div className="mb-8">
        <Link href="/projects" className="text-sm text-mutefg no-underline hover:underline">
          ← projects
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-card shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <EntryContent
          meta={{
            title: entry.meta.title,
            date: entry.meta.date,
            kindLabel: entry.meta.kindLabel,
            image: entry.meta.image,
            summary: entry.meta.summary,
          }}
          html={entry.html}
        />
      </div>
    </Container>
  );
}
