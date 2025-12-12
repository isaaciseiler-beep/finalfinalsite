import Container from "@/components/Container";

export const dynamic = "force-static";

const HEADSHOT_URL =
  "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/site/headshotgrad.jpg";

type Chapter = {
  id: string;
  label: string;
};

const CHAPTERS: Chapter[] = [
  { id: "intro", label: "intro" },
  { id: "portrait", label: "portrait" },
  { id: "origins", label: "origins" },
  { id: "work", label: "work" },
  { id: "values", label: "values" },
  { id: "life", label: "life" },
];

function Lilypad({
  id,
  kicker,
  title,
  align = "center",
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  align?: "left" | "center" | "right";
  children: React.ReactNode;
}) {
  const alignClass =
    align === "left"
      ? "md:justify-start"
      : align === "right"
      ? "md:justify-end"
      : "md:justify-center";

  return (
    <section id={id} className="snap-start snap-always">
      <div
        className={[
          // panel height
          "min-h-[78svh] md:min-h-[82svh]",
          // center content + lilypad alignment
          "flex items-center justify-center",
          alignClass,
          // breathing room
          "px-4 py-10 md:px-10",
        ].join(" ")}
      >
        <div className="card w-full max-w-3xl p-6 md:p-10">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-mutefg">{kicker}</p>
            <p className="text-xs text-mutefg">scroll to hop</p>
          </div>

          <h2 className="mt-3 text-2xl tracking-tight md:text-3xl">{title}</h2>

          <div className="mt-5 space-y-4 text-base leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <Container>
      <div className="card overflow-hidden p-0">
        {/* scroll container (the “lilypad pond”) */}
        <div className="relative h-[88svh] overflow-y-auto overscroll-contain scroll-smooth snap-y snap-mandatory">
          {/* sticky header / chapter rail */}
          <div className="sticky top-0 z-10 border-b border-border bg-black/30 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="min-w-0">
                <h1 className="text-3xl tracking-tight">about</h1>
                <p className="mt-1 text-xs text-mutefg">
                  a small, scrollable biography in chapters
                </p>
              </div>

              <nav aria-label="chapters" className="flex items-center gap-2">
                {CHAPTERS.map((c) => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1.5 text-xs text-mutefg hover:text-current"
                    title={c.label}
                  >
                    <span className="h-2.5 w-2.5 rounded-full border border-border bg-black/20 group-hover:bg-black/40" />
                    <span className="hidden sm:inline">{c.label}</span>
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* panels */}
          <Lilypad
            id="intro"
            kicker="chapter 0"
            title="hi. i’m isaac."
            align="center"
          >
            <p>
              This page is the version of a handshake I can offer online: a few
              stories, a few soft edges, and the kind of context that never fits
              neatly into a bio line.
            </p>
            <p>
              I’ve always been drawn to craft that disappears into daily life.
              The things that feel inevitable after the fact: a sentence that
              lands, a layout that breathes, a choice that makes you feel gently
              guided instead of managed.
            </p>
            <p>
              If you only take one thing from this: I care about how things
              feel. Not in a dramatic way—more in the quiet way you notice when
              something is made with attention, and you can finally relax into
              using it.
            </p>
            <div className="mt-6 rounded-xl border border-border bg-black/10 p-4">
              <p className="text-sm text-mutefg">
                how to read this page (the intended way)
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Scroll like you’re stepping between little stones. Each panel is
                its own moment.
              </p>
            </div>
          </Lilypad>

          <Lilypad
            id="portrait"
            kicker="chapter 1"
            title="a face to the words"
            align="right"
          >
            <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-center">
              <div className="space-y-4">
                <p>
                  For a long time, I preferred to stay behind the work. It’s
                  comfortable there: be useful, be quiet, let the output do the
                  talking.
                </p>
                <p>
                  But eventually I realized something simple: good work is
                  personal in the most ordinary sense. It’s made by a person.
                  So—here I am.
                </p>
                <p className="text-sm text-mutefg">
                  (Also: yes, it still feels a little strange to post a
                  headshot.)
                </p>
              </div>

              <figure className="md:pl-2">
                <div className="overflow-hidden rounded-xl border border-border bg-black/10">
                  <img
                    src={HEADSHOT_URL}
                    alt="headshot portrait"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="mt-3 text-xs leading-relaxed text-mutefg">
                  I like when a site feels inhabited. A photo helps.
                </figcaption>
              </figure>
            </div>
          </Lilypad>

          <Lilypad
            id="origins"
            kicker="chapter 2"
            title="the long habit of making"
            align="left"
          >
            <p>
              I’ve been a maker for as long as I can remember—usually in small
              ways, usually in the margins. The kind of making that starts as
              curiosity: “Why does this feel good?” “What happens if I simplify
              it?” “What would I keep if I had to cut it in half?”
            </p>
            <p>
              I learned early that I understand the world better when my hands
              are on something—drafting, arranging, rewriting, adjusting. Not
              because everything needs to be “optimized,” but because shaping
              something teaches you what you actually think.
            </p>
            <p>
              That habit never left. It just grew up a little. Today it shows up
              as a steady preference for clarity, restraint, and the small kind
              of excellence you can feel but rarely see.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm text-mutefg">i’m at my best when</p>
                <p className="mt-2 text-sm leading-relaxed">
                  I have a messy idea and enough time to turn it into something
                  simple.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm text-mutefg">i’m usually carrying</p>
                <p className="mt-2 text-sm leading-relaxed">
                  a notes app full of half-sentences and an opinion about
                  typography I didn’t ask for.
                </p>
              </div>
            </div>
          </Lilypad>

          <Lilypad
            id="work"
            kicker="chapter 3"
            title="what i do (most days)"
            align="center"
          >
            <p>
              Most days, I’m translating. Someone has an intention—sometimes
              clear, sometimes not—and my job is to help it become something a
              stranger can understand on the first try.
            </p>
            <p>
              That can look like shaping a page so it feels calm. It can look
              like rewriting a paragraph until it sounds like a human again. It
              can look like smoothing a flow until the “next step” is obvious
              without being bossy.
            </p>
            <p>
              I’m not interested in making things louder than they need to be. I
              am interested in making them truer—more readable, more usable, more
              aligned with the way people actually move through a day.
            </p>

            <div className="mt-6 rounded-xl border border-border bg-black/10 p-4">
              <p className="text-sm text-mutefg">the work i tend to enjoy</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
                <li>turning “almost” into “of course”</li>
                <li>editing until the tone feels like a person, not a brand</li>
                <li>design that makes room for the reader</li>
                <li>small systems that stay friendly over time</li>
              </ul>
            </div>
          </Lilypad>

          <Lilypad
            id="values"
            kicker="chapter 4"
            title="a few things i try to keep true"
            align="right"
          >
            <p>
              I’m not a mission-statement person. I’m more of a small-rules
              person. The kind of rules you can carry into any project and they
              still help.
            </p>
            <p>These are some of mine:</p>

            <div className="mt-2 grid gap-3">
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm leading-relaxed">
                  <span className="text-mutefg">01.</span>{" "}
                  make it understandable without a manual.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm leading-relaxed">
                  <span className="text-mutefg">02.</span>{" "}
                  choose the kindest honest word.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm leading-relaxed">
                  <span className="text-mutefg">03.</span>{" "}
                  if it doesn’t matter, don’t make it louder.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm leading-relaxed">
                  <span className="text-mutefg">04.</span>{" "}
                  leave the place a little better than you found it.
                </p>
              </div>
            </div>

            <blockquote className="mt-6 rounded-xl border border-border bg-black/10 p-4 text-sm leading-relaxed text-mutefg">
              I’m drawn to work that respects attention. The best experiences
              don’t shout—they hold the door open.
            </blockquote>
          </Lilypad>

          <Lilypad
            id="life"
            kicker="chapter 5"
            title="life, not just work"
            align="left"
          >
            <p>
              Outside the screen, I’m usually chasing a quieter kind of fun:
              long walks, good coffee, books with dog-eared pages, meals that
              take slightly too long (in the best way).
            </p>
            <p>
              I keep lists—of lines I like, of places that feel like home, of
              small details that make me pause. Some of those lists become
              projects. Some of them just stay as evidence that I was paying
              attention.
            </p>
            <p>
              If you want to reach out, the best note is a simple one. Say what
              you’re making, what you’re curious about, or what you’re stuck on.
              I have a soft spot for sincere messages.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm text-mutefg">this page on purpose</p>
                <p className="mt-2 text-sm leading-relaxed">
                  minimal, readable, and meant to be taken slowly.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-black/10 p-4">
                <p className="text-sm text-mutefg">last lilypad</p>
                <p className="mt-2 text-sm leading-relaxed">
                  thanks for spending your attention here.
                </p>
              </div>
            </div>
          </Lilypad>
        </div>
      </div>
    </Container>
  );
}

