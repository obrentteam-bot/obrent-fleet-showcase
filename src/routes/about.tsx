import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import aboutHero from "@/assets/about-hero.png.asset.json";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Über uns — OBRENT Ludwigshafen am Rhein" },
      { name: "description", content: "OBRENT — Exzellenz, Leidenschaft, Premium Mobility. Luxus-Autovermietung aus Ludwigshafen am Rhein." },
      { property: "og:title", content: "Über uns — OBRENT" },
      { property: "og:description", content: "Exzellenz. Leidenschaft. Premium Mobility." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="dark relative w-full bg-onyx">
        <img
          src={aboutHero.url}
          alt="OBRENT — Über uns. Exzellenz. Leidenschaft. Premium Mobility."
          className="block w-full h-auto"
          fetchPriority="high"
          decoding="async"
        />
      </section>
    </SiteLayout>
  );
}
