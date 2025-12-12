import Link from "next/link";
import Container from "@/components/Container";
export const dynamic = "force-static";

const projects = [
  { slug: "sample-project", title: "sample project", summary: "concise description of impact" },
  { slug: "another-project", title: "another project", summary: "short line on results" },
];

export default function Projects() {
  return (
    <Container>
      <h1 className="mb-4 text-3xl">projects</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.slug} href={`/projects/${p.slug}`} className="card block p-6 no-underline hover:scale-[1.01] transition">
            <div className="text-lg">{p.title}</div>
            <p className="text-sm text-mutefg">{p.summary}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
