// app/page.tsx — DROP-IN REPLACEMENT (adds real h1 without changing visuals)
import ParallaxHero from "@/components/ParallaxHero";
import AboutBrief from "@/components/AboutBrief";
import ProjectsTeaser from "@/components/ProjectsTeaser";
import PhotoCarousel from "@/components/PhotoCarousel";
import NowStatus from "@/components/NowStatus";
import ContentFrame from "@/components/ContentFrame";

export default function Page() {
  return (
    <main className="pb-20 space-y-16 md:space-y-24">
      <h1 className="sr-only">isaac seiler</h1>

      <ParallaxHero
        lines={[
          "Working at the intersection of",
          "AI, emerging tech,",
          "and society.",
        ]}
      />

      <ContentFrame>
        <section className="min-w-0">
          <AboutBrief />
        </section>
        <section className="min-w-0">
          <ProjectsTeaser />
        </section>
        <section className="min-w-0">
          <PhotoCarousel />
        </section>
        <section className="min-w-0">
          <NowStatus />
        </section>
      </ContentFrame>
    </main>
  );
}
