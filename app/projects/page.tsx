import Container from "@/components/Container";
import ProjectsFeed from "@/components/ProjectsFeed";
import { getFeedEntries } from "@/lib/projectsFeed";

export const dynamic = "force-static";

export default async function ProjectsPage() {
  const items = await getFeedEntries();

  return (
    <Container>
      {/* full-bleed like your Experience page */}
      <div className="-mx-4 sm:-mx-6">
        <div className="px-4 sm:px-6 pb-16">
          <header className="mb-6 pt-8 md:pt-10">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              projects
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-mutefg">
              A running feed of shipped work, experiments, and writing.
            </p>
          </header>

          <ProjectsFeed items={items} />

          {items.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-mutefg">
              No entries found. Add MDX files under{" "}
              <code>content/projects</code>, <code>content/blog</code> (or{" "}
              <code>content/posts</code>), and <code>content/articles</code>.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
