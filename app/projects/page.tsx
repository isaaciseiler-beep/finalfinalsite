import Container from "@/components/Container";
import ProjectsFeed from "@/components/ProjectsFeed";
import { getFeedEntries } from "@/lib/projectsFeed";

export const dynamic = "force-static";

export default async function ProjectsPage() {
  const items = await getFeedEntries();

  return (
    <Container>
      {/* full-bleed so the feed hits the pane edge */}
      <div className="-mx-4 sm:-mx-6">
        <div className="px-4 sm:px-6 pb-16">
          {/* no header: start directly with filter tabs */}
          <ProjectsFeed items={items} />

          {items.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-mutefg">
              No entries found. Add MDX files under <code>content/projects</code>,{" "}
              <code>content/blog</code>, and <code>content/articles</code>.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
