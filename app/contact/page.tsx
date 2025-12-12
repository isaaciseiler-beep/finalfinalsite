export const dynamic = "force-static";

import Container from "@/components/Container";

export default function Contact() {
  return (
    <Container>
      <h1 className="mb-4 text-3xl">contact</h1>

      <div className="card space-y-4 p-6">
        <p className="text-sm text-mutefg">
          Email is best. You can also connect with me on LinkedIn.
        </p>

        <div className="space-y-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-mutefg">email</div>
            <a
              href="mailto:isaacseiler@gmail.com"
              className="mt-1 inline-flex items-center rounded-xl border border-border bg-transparent px-4 py-2 text-sm outline-none transition hover:opacity-90 focus-visible:ring-2"
            >
              isaacseiler@gmail.com
            </a>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-mutefg">linkedin</div>
            <a
              href="https://www.linkedin.com/in/isaacseiler/"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1 inline-flex items-center rounded-xl border border-border bg-transparent px-4 py-2 text-sm outline-none transition hover:opacity-90 focus-visible:ring-2"
            >
              connect on LinkedIn
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}
