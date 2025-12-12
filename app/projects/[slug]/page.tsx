import Container from "@/components/Container";
import { notFound } from "next/navigation";

const PROJECTS: Record<string, { title: string; body: string }> = {
  "sample-project": {
    title: "sample project",
    body:
      "write a high-quality, news-article style case study here. include problem, approach, and outcome. keep to 400–700 words."
  },
  "another-project": {
    title: "another project",
    body:
      "another detailed write-up. keep it factual. use short paragraphs and subheads if needed."
  },
};

export function generateStaticParams() {
  return Object.keys(PROJECTS).map((slug) => ({ slug }));
}

export const dynamic = "force-static";

export default function Project({ params }: { params: { slug: string } }) {
  const data = PROJECTS[params.slug];
  if (!data) return notFound();

  return (
    <Container>
      <article className="prose prose-invert max-w-none">
        <h1>{data.title}</h1>
        <p>{data.body}</p>
      </article>
    </Container>
  );
}
