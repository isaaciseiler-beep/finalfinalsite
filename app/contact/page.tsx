export const dynamic = "force-static";

export default function Contact() {
  return (
    <main className="w-full px-6 pt-10 md:pt-14 pb-0 h-[calc(100dvh-var(--footer-h,88px))] overflow-hidden">
      <div className="-mx-4 sm:-mx-6 h-full">
        <div className="flex h-full flex-col px-4 sm:px-6 pt-[112px] md:pt-[112px]">
          <div className="min-h-0 flex-1">
            <div className="mx-auto grid h-full w-full max-w-[1100px] grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4 md:gap-8">
              {/* contact */}
              <a
                href="mailto:isaacseiler@gmail.com"
                aria-label="email isaac"
                className="group block w-full rounded-3xl h-[min(26vh,200px)] lg:h-[min(42vmin,420px)] lg:w-[min(42vmin,420px)] lg:mx-auto transition-transform duration-150 active:scale-[0.985] active:translate-y-[1px] !no-underline hover:!no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-black/40 shadow-subtle transition-[border-radius,background-color,box-shadow,filter] duration-500 ease-out will-change-transform group-hover:rounded-full group-hover:bg-[#aa96af] group-hover:shadow-[0_24px_90px_rgba(0,0,0,0.75)] group-hover:animate-[floatContact_2.8s_ease-in-out_infinite] motion-reduce:group-hover:animate-none group-active:brightness-95">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-150 group-hover:rounded-full group-active:opacity-100 bg-white/10"
                  />
                  <span className="relative text-5xl font-normal tracking-tight text-white group-hover:text-black/90 md:text-6xl">
                    Contact
                  </span>
                </div>
              </a>

              {/* connect */}
              <a
                href="https://www.linkedin.com/in/isaacseiler/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="connect on linkedin"
                className="group block w-full rounded-3xl h-[min(26vh,200px)] lg:h-[min(42vmin,420px)] lg:w-[min(42vmin,420px)] lg:mx-auto transition-transform duration-150 active:scale-[0.985] active:translate-y-[1px] !no-underline hover:!no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-black/40 shadow-subtle transition-[border-radius,background-color,box-shadow,filter] duration-500 ease-out will-change-transform group-hover:rounded-full group-hover:bg-[#3e50cd] group-hover:shadow-[0_24px_90px_rgba(0,0,0,0.75)] group-hover:animate-[floatConnect_2.6s_ease-in-out_infinite] motion-reduce:group-hover:animate-none group-active:brightness-95">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-150 group-hover:rounded-full group-active:opacity-100 bg-white/10"
                  />
                  <span className="relative text-5xl font-normal tracking-tight text-white md:text-6xl">
                    Connect
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

