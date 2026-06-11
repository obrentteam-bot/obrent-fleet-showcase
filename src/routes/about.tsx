import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import heroSunset from "@/assets/about-hero-sunset.png";
import { Users, Handshake, Crown, ArrowRight, Car, ShieldCheck, MapPin, Star } from "lucide-react";

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
      {/* HERO — split layout */}
      <section className="relative bg-onyx pt-24 md:pt-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[80vh] py-12 lg:py-0">
            {/* Left text */}
            <div className="lg:col-span-5">
              <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem] mb-8">
                Über uns
              </p>
              <h1 className="font-display text-cream text-5xl md:text-6xl lg:text-[5rem] leading-[1.02] tracking-tight">
                Exzellenz.<br />
                Leidenschaft.<br />
                <span className="text-gold italic font-light">Premium Mobility.</span>
              </h1>
              <div className="mt-8 h-px w-20 bg-gold/70" />
              <p className="mt-8 text-cream/65 text-base md:text-[1.05rem] font-light leading-[1.85] max-w-md">
                OBRENT steht für kompromisslose Qualität, Diskretion und einen Anspruch, der weit über das gewöhnliche Maß einer Autovermietung hinausgeht.
              </p>
            </div>

            {/* Right image */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/11] overflow-hidden rounded-sm bg-jet">
                <img
                  src={heroSunset}
                  alt="OBRENT Premium Fleet bei Sonnenuntergang"
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-onyx/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY + STATS */}
      <section className="relative bg-onyx text-cream py-24 md:py-32 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem]">Unsere Geschichte</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-5 leading-[1.05]">
                Mehr als nur<br />
                <span className="text-gold italic font-light">Fahrzeuge.</span>
              </h2>
              <div className="mt-10 hidden lg:block h-32 w-px bg-gradient-to-b from-gold/60 to-transparent" />
            </div>

            <div className="lg:col-span-7 space-y-6 text-cream/75 text-base md:text-lg leading-[1.85] font-light">
              <p>
                Aus Ludwigshafen am Rhein heraus kuratieren wir eine handverlesene Flotte exklusiver Fahrzeuge — von sportlichen Ikonen bis hin zu repräsentativen Limousinen.
              </p>
              <p>
                Jedes Detail, jede Übergabe und jeder Service entsteht mit der Leidenschaft von Menschen, die selbst Enthusiasten sind. Wir verstehen, dass ein Premium-Fahrzeug nicht nur ein Mittel zum Zweck ist — es ist ein Erlebnis, eine Aussage, ein Moment.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 pt-12">
                {[
                  { icon: Car, value: "150+", label: "Fahrzeuge" },
                  { icon: ShieldCheck, value: "5+", label: "Jahre Erfahrung" },
                  { icon: MapPin, value: "1", label: "Standort Ludwigshafen" },
                  { icon: Star, value: "100%", label: "Kundenfokus" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex flex-col items-center text-center">
                    <Icon className="w-7 h-7 text-gold mb-5" strokeWidth={1.5} />
                    <div className="font-display text-3xl md:text-4xl text-cream mb-3">{value}</div>
                    <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/55 leading-relaxed">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="relative bg-gradient-to-b from-jet/40 via-onyx to-onyx text-cream py-24 md:py-32 border-y border-cream/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem]">Was uns antreibt</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-5">Unsere Werte</h2>
            <div className="mx-auto mt-6 h-px w-14 bg-gold" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Users,
                title: "Menschen",
                text: "Im Zentrum jeder Begegnung steht der Mensch. Persönlich, aufmerksam, auf Augenhöhe – vom ersten Kontakt bis zur Schlüsselübergabe.",
              },
              {
                icon: Handshake,
                title: "Vertrauen",
                text: "Diskretion, Verlässlichkeit und Transparenz bilden das Fundament jeder Zusammenarbeit. Ein Versprechen, das wir täglich neu einlösen.",
              },
              {
                icon: Crown,
                title: "Leidenschaft",
                text: "Wir leben für Automobile. Diese Begeisterung spüren Sie in jedem Fahrzeug, jedem Detail und jedem Moment hinter dem Steuer.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group text-center p-10 md:p-12 rounded-2xl border border-border bg-jet/30 hover:border-gold/40 hover:bg-jet/50 transition-colors"
              >
                <div className="mx-auto w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center mb-8 transition-colors group-hover:border-gold group-hover:bg-gold/5">
                  <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl tracking-wide mb-5">{title}</h3>
                <p className="text-cream/65 font-light text-sm md:text-[0.95rem] leading-[1.85]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-onyx text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img
            src={heroSunset}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/80 to-onyx/30" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem] mb-6">
              Bereit für Ihr nächstes Erlebnis?
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
              Bereit für ein unvergessliches<br />
              <span className="text-gold italic font-light">Erlebnis?</span>
            </h2>
            <p className="mt-7 text-cream/70 text-base md:text-lg font-light">
              Entdecken Sie unsere Flotte oder sprechen Sie persönlich mit uns.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/fleet"
                className="group inline-flex items-center gap-3 bg-gold text-onyx px-8 py-4 text-xs tracking-[0.28em] uppercase font-medium hover:bg-gold/90 transition-colors"
              >
                Zur Flotte
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 border border-cream/25 text-cream px-8 py-4 text-xs tracking-[0.28em] uppercase font-medium hover:border-gold hover:text-gold transition-colors"
              >
                Kontakt aufnehmen
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
