import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { Users, Handshake, Mountain } from "lucide-react";

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
  useI18n();

  const values = [
    { Icon: Users, label: "MENSCHEN" },
    { Icon: Handshake, label: "VERTRAUEN" },
    { Icon: Mountain, label: "LEIDENSCHAFT" },
  ];

  return (
    <SiteLayout>
      <section className="dark relative min-h-[100svh] w-full overflow-hidden bg-onyx text-cream">
        {/* Background image */}
        <img
          src="/hero-fleet-sunset.webp"
          alt="OBRENT Premium Fahrzeugflotte bei Sonnenuntergang"
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        {/* Dark gradient overlay for legibility on the left */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.08_0_0/0.85)_0%,oklch(0.08_0_0/0.55)_40%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.08_0_0/0.35)_0%,transparent_30%,transparent_70%,oklch(0.08_0_0/0.55)_100%)]"
        />

        {/* Content */}
        <div className="relative z-10 min-h-[100svh] flex items-center px-6 md:px-12 lg:px-20 pt-32 pb-16">
          <div className="max-w-2xl w-full">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight text-cream drop-shadow-[0_8px_40px_oklch(0_0_0/0.7)]">
              ÜBER UNS
            </h1>

            <div className="mt-6 h-px w-24 bg-gold" />

            <p className="mt-10 text-cream text-lg md:text-xl tracking-[0.18em] font-light leading-relaxed">
              EXZELLENZ. LEIDENSCHAFT.
              <br />
              PREMIUM MOBILITY.
            </p>

            <p className="mt-10 max-w-md text-cream/80 font-light leading-relaxed text-base">
              Wir stehen für mehr als nur Vermietung. Wir bieten ein Erlebnis – geprägt von Qualität, Vertrauen und echter Leidenschaft für außergewöhnliche Fahrzeuge.
            </p>

            {/* Values row */}
            <div className="mt-16 flex items-start gap-8 sm:gap-12">
              {values.map(({ Icon, label }, i) => (
                <div key={label} className="flex items-center gap-8 sm:gap-12">
                  <div className="flex flex-col items-center gap-3">
                    <Icon className="h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden />
                    <span className="text-[10px] sm:text-xs tracking-[0.25em] text-cream/90 font-light">
                      {label}
                    </span>
                  </div>
                  {i < values.length - 1 && (
                    <span aria-hidden className="h-10 w-px bg-cream/25 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
