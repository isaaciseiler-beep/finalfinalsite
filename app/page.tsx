// app/page.tsx — DROP-IN REPLACEMENT
import ParallaxHero from "@/components/ParallaxHero";
import Parallax from "@/components/Parallax";
import AboutBrief from "@/components/AboutBrief";
import ProjectsTeaser from "@/components/ProjectsTeaser";
import PhotoCarousel from "@/components/PhotoCarousel";
import NowStatus from "@/components/NowStatus";
import ContentFrame from "@/components/ContentFrame";

export default function Page() {
  return (
    <main className="pb-20">
      <h1 className="sr-only">isaac seiler</h1>

      <div className="space-y-16 md:space-y-24">
        <ParallaxHero
          lines={[
            "At the intersection of",
            "AI, emerging tech,",
            "and society.",
          ]}
        />

        <ContentFrame>
          {/* extra buffer between blocks + stronger parallax on each section */}
          <div className="space-y-10 md:space-y-14">
            <section className="min-w-0">
              <Parallax amount={-110}>
                <AboutBrief />
              </Parallax>
            </section>

            <section className="min-w-0">
              <Parallax amount={-130}>
                <ProjectsTeaser />
              </Parallax>
            </section>

            <section className="min-w-0">
              <Parallax amount={-120}>
                <PhotoCarousel />
              </Parallax>
            </section>

            <section className="min-w-0">
              <Parallax amount={-95}>
                <NowStatus />
              </Parallax>
            </section>
          </div>
        </ContentFrame>
      </div>
    </main>
  );
}
