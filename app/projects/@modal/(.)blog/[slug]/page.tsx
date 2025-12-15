import { notFound } from "next/navigation";
import Modal from "@/components/Modal";
import EntryContent from "@/components/EntryContent";
import { getEntry, getSlugs } from "@/lib/projectsFeed";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const slugs = await getSlugs("blog");
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogModalPage({ params }: { params: { slug: string } }) {
  const entry = await getEntry("blog", params.slug);
  if (!entry) return notFound();

  return (
    <Modal title={entry.meta.title}>
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
    </Modal>
  );
}
