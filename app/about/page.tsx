import Container from "@/components/Container";

export const dynamic = "force-static";

const HEADSHOT_URL =
  "https://pub-41d52824b0bb4f44898c39e1c3c63cb8.r2.dev/site/headshotgrad.jpg";

const STEPS = 4;

const LILYPAD_CSS = `
  #about-lilypads {
    --dur: 700ms;
    --ease: cubic-bezier(.2,.9,.2,1);
  }

  /* stage: all pads occupy the same space; we toggle visibility by [data-active] */
  #about-lilypads .pad {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translate3d(0,18px,0) scale(.985);
    transition:
      opacity var(--dur) var(--ease),
      transform var(--dur) var(--ease);
    pointer-events: none;
  }

  #about-lilypads[data-active="0"] .pad[data-pad="0"],
  #about-lilypads[data-active="1"] .pad[data-pad="1"],
  #about-lilypads[data-active="2"] .pad[data-pad="2"],
  #about-lilypads[data-active="3"] .pad[data-pad="3"] {
    opacity: 1;
    transform: translate3d(0,0,0) scale(1);
    pointer-events: auto;
  }

  /* subtle dot indicator (kept minimal) */
  #about-lilypads .dots {
    position: absolute;
    left: 50%;
    bottom: 28px;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(0,0,0,.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  #about-lilypads .dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: currentColor;
    opacity: .32;
    transform: scale(.95);
    transition: opacity 320ms ease, transform 320ms ease;
  }

  #about-lilypads[data-active="0"] .dot[data-dot="0"],
  #about-lilypads[data-active="1"] .dot[data-dot="1"],
  #about-lilypads[data-active="2"] .dot[data-dot="2"],
  #about-lilypads[data-active="3"] .dot[data-dot="3"] {
    opacity: .95;
    transform: scale(1.15);
  }

  @media (prefers-reduced-motion: reduce) {
    #about-lilypads .pad {
      transition: none;
      transform: none;
    }
    #about-lilypads .dot {
      transition: none;
      transform: none;
    }
  }
`;

const LILYPAD_SCRIPT = `
(() => {
  const root = document.getElementById("about-lilypads");
  if (!root) return;

  const steps = Number(root.getAttribute("data-steps") || "1");
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const pads = Array.from(root.querySelectorAll("[data-pad]"));

  let raf = 0;

  const applyA11y = (active) => {
    for (const el of pads) {
      const isActive = el.getAttribute("data-pad") === String(active);
      if (isActive) el.removeAttribute("aria-hidden");
      else el.setAttribute("aria-hidden", "true");
    }
  };

  const update = () => {
    raf = 0;

    const rect = root.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const total = root.offsetHeight - window.innerHeight;

    if (total <= 0 || steps <= 1) {
      root.dataset.active = "0";
      applyA11y(0);
      return;
    }

    // each “hop” is one viewport of scroll
    const step = total / (steps - 1);
    const y = window.scrollY - start;

    // round to keep it hop-like (not continuously morphing)
    const idx = clamp(Math.round(y / step), 0, steps - 1);

    if (root.dataset.active !== String(idx)) {
      root.dataset.active = String(idx);
      applyA11y(idx);
    }
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(update);
  };

  // init
  root.dataset.active = root.dataset.active || "0";
  applyA11y(Number(root.dataset.active || "0"));
  update();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
})();
`;

function LilyPadShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-6 md:px-12">
      <div
        className={[
          "relative isolate mx-auto w-full",
          "max-w-[1600px]",
          "rounded-[36px] md:rounded-[72px]",
          "bg-black/10",
          "shadow-[0_40px_140px_rgba(0,0,0,0.30)]",
          "backdrop-blur-sm",
          "px-7 py-10 md:px-16 md:py-20",
          // stacked “lilypad” layers (no borders)
          "before:content-[''] before:absolute before:inset-0 before:-z-10",
          "before:rounded-[36px] md:before:rounded-[72px]",
          "before:translate-y-6 before:-rotate-[0.8deg] before:scale-[0.99]",
          "before:bg-black/10 before:opacity-70",
          "after:content-[''] after:absolute after:inset-0 after:-z-10",
          "after:rounded-[36px] md:after:rounded-[72px]",
          "after:translate-y-3 after:rotate-[0.6deg] after:scale-[0.995]",
          "after:bg-black/10 after:opacity-85",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <Container>
      <h1 className="sr-only">about</h1>

      {/* full-bleed */}
      <div className="relative overflow-x-hidden">
        <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw]">
          {/* scroll track */}
          <div
            id="about-lilypads"
            data-steps={STEPS}
            data-active="0"
            className="relative"
            style={{ height: `calc(100svh * ${STEPS})` }}
          >
            {/* sticky stage */}
            <div className="sticky top-0 h-[100svh]">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* intro */}
                <section className="pad" data-pad="0">
                  <LilyPadShell>
                    <div className="w-full">
                      <p className="text-sm text-mutefg">intro</p>
                      <h2 className="mt-4 text-6xl font-medium tracking-tight leading-[0.92] md:text-8xl">
                        hi, i’m isaac.
                      </h2>
                      <p className="mt-6 max-w-[54ch] text-xl leading-snug text-mutefg md:text-3xl">
                        i like making things that feel simple to hold: calm
                        pages, clear words, small details that don’t ask for
                        attention.
                      </p>
                      <p className="mt-4 max-w-[54ch] text-xl leading-snug text-mutefg md:text-3xl">
                        this is the short version—four lilypads, one story.
                      </p>

                      <p className="mt-10 text-sm text-mutefg">
                        scroll to hop
                      </p>
                    </div>
                  </LilyPadShell>
                </section>

                {/* experience */}
                <section className="pad" data-pad="1">
                  <LilyPadShell>
                    <div className="grid w-full gap-10 md:grid-cols-[1.2fr,0.8fr] md:items-center">
                      <div>
                        <p className="text-sm text-mutefg">experience</p>
                        <h2 className="mt-4 text-5xl font-medium tracking-tight leading-[0.95] md:text-7xl">
                          a few chapters in.
                        </h2>
                        <p className="mt-6 max-w-[52ch] text-xl leading-snug text-mutefg md:text-3xl">
                          i’ve bounced between writing, design, and building—most
                          often on small teams where you do a little of
                          everything and learn fast.
                        </p>
                        <p className="mt-4 max-w-[52ch] text-xl leading-snug text-mutefg md:text-3xl">
                          i’m happiest in the middle of it: shaping the idea,
                          tightening the language, and getting it into the
                          world.
                        </p>
                      </div>

                      <div className="flex justify-start md:justify-end">
                        <div className="relative aspect-[4/5] w-[min(520px,82vw)] overflow-hidden rounded-[28px] bg-black/15 shadow-[0_30px_100px_rgba(0,0,0,0.28)] md:rounded-[48px]">
                          <img
                            src={HEADSHOT_URL}
                            alt="headshot portrait"
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      </div>
                    </div>
                  </LilyPadShell>
                </section>

                {/* professional interests */}
                <section className="pad" data-pad="2">
                  <LilyPadShell>
                    <div className="w-full">
                      <p className="text-sm text-mutefg">
                        professional interests
                      </p>
                      <h2 className="mt-4 text-5xl font-medium tracking-tight leading-[0.95] md:text-7xl">
                        what i’m drawn to.
                      </h2>

                      <ul className="mt-8 space-y-5 text-2xl leading-tight md:text-4xl">
                        <li className="flex gap-4">
                          <span className="text-mutefg">—</span>
                          <span>writing that sounds like a person</span>
                        </li>
                        <li className="flex gap-4">
                          <span className="text-mutefg">—</span>
                          <span>interfaces that feel obvious, not loud</span>
                        </li>
                        <li className="flex gap-4">
                          <span className="text-mutefg">—</span>
                          <span>systems that stay simple as they grow</span>
                        </li>
                        <li className="flex gap-4">
                          <span className="text-mutefg">—</span>
                          <span>craft you notice only after it’s missing</span>
                        </li>
                      </ul>

                      <p className="mt-10 max-w-[56ch] text-lg leading-relaxed text-mutefg md:text-2xl">
                        if it feels calm, readable, and quietly intentional, i
                        want to be near it.
                      </p>
                    </div>
                  </LilyPadShell>
                </section>

                {/* personal interests */}
                <section className="pad" data-pad="3">
                  <LilyPadShell>
                    <div className="w-full">
                      <p className="text-sm text-mutefg">personal interests</p>
                      <h2 className="mt-4 text-5xl font-medium tracking-tight leading-[0.95] md:text-7xl">
                        outside the work.
                      </h2>

                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className="text-2xl leading-tight md:text-4xl">
                          <p>long walks</p>
                          <p>good coffee</p>
                          <p>books with margins</p>
                        </div>
                        <div className="text-2xl leading-tight md:text-4xl">
                          <p>music while cooking</p>
                          <p>photos of ordinary light</p>
                          <p>quiet mornings</p>
                        </div>
                      </div>

                      <p className="mt-10 max-w-[56ch] text-lg leading-relaxed text-mutefg md:text-2xl">
                        i like days that feel un-rushed, and work that leaves
                        room for the human on the other side.
                      </p>
                    </div>
                  </LilyPadShell>
                </section>
              </div>

              {/* minimal progress dots (no header, no borders) */}
              <div
                className="dots text-mutefg"
                aria-hidden="true"
              >
                <span className="dot" data-dot="0" />
                <span className="dot" data-dot="1" />
                <span className="dot" data-dot="2" />
                <span className="dot" data-dot="3" />
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{ __html: LILYPAD_CSS }} />
          <script dangerouslySetInnerHTML={{ __html: LILYPAD_SCRIPT }} />
        </div>
      </div>
    </Container>
  );
}
