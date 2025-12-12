import Container from "@/components/Container";
export const dynamic = "force-static";

export default function About() {
  return (
    <Container>
      <h1 className="mb-4 text-3xl">about</h1>
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="card p-6">
          <p className="text-sm text-mutefg">bio</p>
          <p className="mt-2 leading-relaxed">
            short bio text goes here. replace with your details. keep it concise.
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-mutefg">photo</p>
          <div className="mt-2 aspect-square rounded-xl border border-border bg-black/50" />
        </div>
      </div>
    </Container>
  );
}
