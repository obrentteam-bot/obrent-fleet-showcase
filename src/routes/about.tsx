import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import heroSunset from "@/assets/about-hero-sunset.png.asset.json";
import { Users, Handshake, Mountain, ArrowRight } from "lucide-react";

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
      {/* HERO */}
      <section className="relative w-full bg-onyx overflow-hidden">
        <div className="relative w-full">
          <img
            src={heroSunset.url}
            alt="OBRENT Premium Fleet bei Sonnenuntergang"
            className="block w-full h-[60vh] md:h-[80vh] lg:h-[88vh] object-cover"
            fetchPriority="high"
            decoding="async"
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-onyx/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-onyx/70 via-onyx/20 to-transparent" />

          {/* Hero content */}
          <div className="absolute inset-0 flex items-end md:items-center">
            <div className="container mx-auto px-6 md:px-10 pb-12 md:pb-0">
              <div className="max-w-2xl">
                <p className="text-gold tracking-[0.35em] text-xs md:text-sm uppercase mb-4 md:mb-6">
                  OBRENT · Ludwigshafen am Rhein
                </p>
                <h1 className="font-serif text-cream text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight drop-shadow-2xl">
                  Über uns
                </h1>
                <div className="mt-6 h-px w-24 bg-gold" />
                <p className="mt-6 text-cream/90 text-lg md:text-xl font-light tracking-wide max-w-xl">
                  Exzellenz. Leidenschaft. Premium Mobility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-onyx text-cream py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
            <div className="md:col-span-4">
              <p className="text-gold tracking-[0.3em] uppercase text-xs">Unsere Geschichte</p>
              <h2 className="font-serif text-4xl md:text-5xl mt-4 leading-tight">
                Mehr als nur <span className="text-gold italic">Fahrzeuge.</span>
              </h2>
            </div>
            <div className="md:col-span-8 space-y-6 text-cream/80 text-lg leading-relaxed font-light">
              <p>
                OBRENT steht für kompromisslose Qualität, Diskretion und einen Anspruch, der weit über das gewöhnliche Maß einer Autovermietung hinausgeht. Aus Ludwigshafen am Rhein heraus kuratieren wir eine handverlesene Flotte exklusiver Fahrzeuge — von sportlichen Ikonen bis hin zu repräsentativen Limousinen.
              </p>
              <p>
                Jedes Detail, jede Übergabe und jeder Service entsteht mit der Leidenschaft von Menschen, die selbst Enthusiasten sind. Wir verstehen, dass ein Premium-Fahrzeug nicht nur ein Mittel zum Zweck ist — es ist ein Erlebnis, eine Aussage, ein Moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-graphite text-cream py-20 md:py-28 border-y border-cream/5">
        <div className="container mx-auto px-6 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-gold tracking-[0.3em] uppercase text-xs">Was uns antreibt</p>
            <h2 className="font-serif text-4xl md:text-5xl mt-4">Unsere Werte</h2>
            <div className="mx-auto mt-6 h-px w-16 bg-gold" />
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            {[
              {
                icon: Users,
                title: "Menschen",
                text: "Im Zentrum jeder Begegnung steht der Mensch. Persönlich, aufmerksam, auf Augenhöhe — vom ersten Kontakt bis zur Schlüsselübergabe.",
              },
              {
                icon: Handshake,
                title: "Vertrauen",
                text: "Diskretion, Verlässlichkeit und Transparenz bilden das Fundament jeder Zusammenarbeit. Ein Versprechen, das wir täglich neu einlösen.",
              },
              {
                icon: Mountain,
                title: "Leidenschaft",
                text: "Wir leben für Automobile. Diese Begeisterung spüren Sie in jedem Fahrzeug, jedem Detail und jedem Moment hinter dem Steuer.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="group">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center transition-colors group-hover:border-gold group-hover:bg-gold/5">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-serif text-2xl tracking-wide">{title}</h3>
                </div>
                <p className="text-cream/70 font-light leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-onyx text-cream py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Bereit für ein <span className="text-gold italic">unvergessliches</span> Erlebnis?
            </h2>
            <p className="mt-6 text-cream/70 text-lg font-light">
              Entdecken Sie unsere Flotte oder sprechen Sie persönlich mit uns.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/fleet"
                className="group inline-flex items-center gap-3 bg-gold text-onyx px-8 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:bg-gold/90 transition-colors"
              >
                Unsere Flotte
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 border border-cream/30 text-cream px-8 py-4 text-sm tracking-[0.2em] uppercase font-medium hover:border-gold hover:text-gold transition-colors"
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
