import Container from "@/components/Container";

export const dynamic = "force-static";

const HEADSHOT_URL =
  "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/site/headshotgrad.jpg";

export default function About() {
  return (
    <Container>
      <header className="mb-8">
        <h1 className="text-3xl tracking-tight md:text-4xl">about</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mutefg">
          I like building things that feel calm to use: clear words, clean
          interactions, and code that stays friendly six months later.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <main className="grid gap-6">
          <section className="card p-6" aria-labelledby="about-bio">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-mutefg">bio</p>
              <span className="text-xs text-mutefg">the human version</span>
            </div>

            <h2 id="about-bio" className="sr-only">
              Bio
            </h2>

            <div className="mt-3 space-y-3 leading-relaxed">
              <p>
                I’m a builder who enjoys the space between an idea and a shipped
                thing. I write code, shape interfaces, and obsess (politely) over
                wording—because a product is usually just a conversation with a
                screen.
              </p>
              <p>
                My sweet spot is turning messy intent into something you can
                actually use: a page that loads fast, a flow that makes sense on
                the first try, a design system that doesn’t fight you, a tiny
                detail that quietly makes the whole experience feel “right.”
              </p>
              <p className="text-sm text-mutefg">
                If you’re looking for a one-liner: I build modern, minimal,
                human-feeling software—high signal, low ceremony.
              </p>
            </div>

            <blockquote className="mt-5 rounded-xl border border-border bg-black/10 p-4 text-sm leading-relaxed text-mutefg">
              I’m drawn to work that respects attention. The best interfaces
              don’t shout—they guide.
            </blockquote>
          </section>

          <section className="card p-6" aria-labelledby="about-principles">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-mutefg">principles</p>
              <span className="text-xs text-mutefg">
                what I optimize for
              </span>
            </div>

            <h2 id="about-principles" className="sr-only">
              Principles
            </h2>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <li className="rounded-xl border border-border p-4">
                <p className="font-medium">Clarity over cleverness</p>
                <p className="mt-1 text-sm leading-relaxed text-mutefg">
                  Simple language, obvious affordances, fewer “gotchas.”
                </p>
              </li>
              <li className="rounded-xl border border-border p-4">
                <p className="font-medium">Delight is a detail</p>
                <p className="mt-1 text-sm leading-relaxed text-mutefg">
                  Micro-interactions that earn their keep—never decorative
                  noise.
                </p>
              </li>
              <li className="rounded-xl border border-border p-4">
                <p className="font-medium">Fast is a feature</p>
                <p className="mt-1 text-sm leading-relaxed text-mutefg">
                  Performance as a default, not a late-stage rescue mission.
                </p>
              </li>
              <li className="rounded-xl border border-border p-4">
                <p className="font-medium">Durable craft</p>
                <p className="mt-1 text-sm leading-relaxed text-mutefg">
                  Maintainable code, predictable patterns, clean edges.
                </p>
              </li>
            </ul>
          </section>

          <section className="card p-6" aria-labelledby="about-how">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-mutefg">how I work</p>
              <span className="text-xs text-mutefg">
                from fog → form
              </span>
            </div>

            <h2 id="about-how" className="sr-only">
              How I work
            </h2>

            <ol className="mt-4 space-y-3">
              <li className="flex gap-3">
                <div className="mt-1 h-5 w-5 shrink-0 rounded-full border border-border bg-black/30" />
                <div>
                  <p className="font-medium">Start with the sentence</p>
                  <p className="mt-1 text-sm leading-relaxed text-mutefg">
                    What are we making, for whom, and why now? If we can’t say
                    it clearly, we’re not ready to ship it.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 h-5 w-5 shrink-0 rounded-full border border-border bg-black/30" />
                <div>
                  <p className="font-medium">Prototype early</p>
                  <p className="mt-1 text-sm leading-relaxed text-mutefg">
                    I’d rather test a rough shape today than debate a perfect
                    plan for a week.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 h-5 w-5 shrink-0 rounded-full border border-border bg-black/30" />
                <div>
                  <p className="font-medium">Choose defaults with intent</p>
                  <p className="mt-1 text-sm leading-relaxed text-mutefg">
                    Most users live in the default path. I treat it like the
                    main product, because it is.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1 h-5 w-5 shrink-0 rounded-full border border-border bg-black/30" />
                <div>
                  <p className="font-medium">Ship, then refine</p>
                  <p className="mt-1 text-sm leading-relaxed text-mutefg">
                    Small releases, tight feedback loops, steady polish. The
                    work gets better when it meets the world.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="card p-6" aria-labelledby="about-offscreen">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm text-mutefg">off-screen</p>
              <span className="text-xs text-mutefg">
                the non-Internet parts
              </span>
            </div>

            <h2 id="about-offscreen" className="sr-only">
              Off-screen
            </h2>

            <div className="mt-3 space-y-3 leading-relaxed">
              <p>
                When I’m not at a keyboard, I’m usually collecting small
                pleasures: long walks, a good espresso, a half-finished notebook
                full of sketches, and the kind of music that makes time feel
                slower.
              </p>
              <p className="text-sm text-mutefg">
                I’m also a shameless fan of well-made tools—anything with
                satisfying ergonomics and quietly excellent design.
              </p>
            </div>
          </section>
        </main>

        <aside className="grid h-fit gap-6 md:sticky md:top-6">
          <div className="card p-6">
            <p className="text-sm text-mutefg">photo</p>
            <div className="mt-3 aspect-square overflow-hidden rounded-xl border border-border bg-black/20">
              <img
                src={HEADSHOT_URL}
                alt="Headshot portrait"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mutefg">
              A real face, so this site doesn’t feel like it was written by a
              committee.
            </p>
          </div>

          <div className="card p-6">
            <p className="text-sm text-mutefg">at a glance</p>
            <dl className="mt-3 space-y-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-mutefg">
                  craft
                </dt>
                <dd className="mt-1 text-sm leading-relaxed">
                  UI engineering, design systems, writing that makes software
                  feel human.
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-mutefg">
                  vibe
                </dt>
                <dd className="mt-1 text-sm leading-relaxed">
                  Minimal, modern, deliberate. A little warmth, zero clutter.
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-mutefg">
                  defaults
                </dt>
                <dd className="mt-1 text-sm leading-relaxed">
                  Accessibility, performance, and clean semantics from the
                  start.
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <p className="text-sm text-mutefg">now</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-mutefg">
              <li>Refining this site until every page feels intentional.</li>
              <li>Collecting tiny interface patterns that scale.</li>
              <li>
                Practicing the art of saying more with less—especially in
                writing.
              </li>
            </ul>

            <div className="mt-4 rounded-xl border border-border bg-black/10 p-4">
              <p className="text-sm leading-relaxed text-mutefg">
                If something here resonates, reach out through whatever link you
                already have. I respond to thoughtful notes, and I’m always up
                for conversations about craft, systems, and building things that
                last.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
