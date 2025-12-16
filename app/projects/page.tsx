import Container from "@/components/Container";
import ProjectsFeed from "@/components/ProjectsFeed";
import { getEntry, getFeedEntries } from "@/lib/projectsFeed";

export const dynamic = "force-static";

export default async function ProjectsPage() {
  const base = await getFeedEntries();

  const items = await Promise.all(
    base.map(async (b) => {
      const full = await getEntry(b.kind, b.slug);
      return {
        id: b.id,
        kind: b.kind,
        kindLabel: b.kindLabel,
        title: b.title,
        image: b.image,
        date: b.date,
        summary: b.summary,
        html: full?.html ?? "",
      };
    }),
  );

  return (
    <Container>
      <div className="-mx-4 sm:-mx-6">
        <div className="px-4 sm:px-6 pt-[112px] md:pt-[112px] pb-16">
          <ProjectsFeed items={items} />
        </div>
      </div>
    </Container>
  );
}
