import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import aboutImage from "@/assets/about-mannheim.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Über uns — OBRENT Mannheim" },
      { name: "description", content: "OBRENT — Luxus-Autovermietung aus Mannheim. Hochwertige Fahrzeuge zu fairen Preisen, persönlich übergeben." },
      { property: "og:title", content: "Über uns — OBRENT Mannheim" },
      { property: "og:description", content: "Premium-Fahrzeuge zur Miete in Mannheim. Fair, persönlich, schnell verfügbar." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  const numerals = ["I", "II", "III", "IV"];

  return (
    <SiteLayout>
      <section className="pt-40 pb-24 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">{t.about.eyebrowHouse}</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-cream leading-[0.95]">
            {t.about.title} <span className="italic text-gold/90 font-light">{t.about.titleItalic}</span>.
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-32 relative">
        {/* decorative giant numeral */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 right-4 md:right-12 font-display text-[14rem] md:text-[22rem] leading-none text-gold/[0.04] select-none"
        >
          01
        </div>

        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center relative">
          {/* IMAGE COLUMN */}
          <div className="lg:col-span-6 relative">
            {/* vertical caption */}
            <div
              aria-hidden
              className="hidden lg:flex absolute -left-10 top-0 bottom-0 flex-col items-center justify-between text-[10px] tracking-[0.4em] uppercase text-cream/30"
            >
              <span>Mannheim</span>
              <span className="rotate-180 [writing-mode:vertical-rl]">Est · MMXXVI</span>
              <span>49°29′N</span>
            </div>

            {/* gold offset frame */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-3 md:-inset-5 border border-gold/40 translate-x-3 translate-y-3 md:translate-x-5 md:translate-y-5 pointer-events-none"
              />
              <div
                aria-hidden
                className="absolute -inset-3 md:-inset-5 -translate-x-3 -translate-y-3 md:-translate-x-5 md:-translate-y-5 bg-[linear-gradient(135deg,oklch(0.78_0.12_85/0.18),transparent_60%)] pointer-events-none"
              />

              <div className="relative aspect-[4/5] overflow-hidden bg-jet group">
                <img
                  src={aboutImage}
                  alt="Mannheimer Wasserturm zur blauen Stunde"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
                {/* cinematic gradient overlay */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,oklch(0.10_0_0/0.55)_85%,oklch(0.10_0_0/0.85)_100%)]"
                />
                {/* corner accents */}
                <span aria-hidden className="absolute top-0 left-0 w-10 h-px bg-gold" />
                <span aria-hidden className="absolute top-0 left-0 w-px h-10 bg-gold" />
                <span aria-hidden className="absolute bottom-0 right-0 w-10 h-px bg-gold" />
                <span aria-hidden className="absolute bottom-0 right-0 w-px h-10 bg-gold" />

                {/* image caption inside */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] tracking-[0.4em] uppercase text-gold/80 mb-1">
                      Heimat
                    </div>
                    <div className="font-display text-2xl md:text-3xl text-cream">
                      Wasserturm<span className="text-gold/80"> · </span>Mannheim
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end text-right">
                    <span className="text-[10px] tracking-[0.4em] uppercase text-cream/50">Seit</span>
                    <span className="font-display text-3xl text-gold">2026</span>
                  </div>
                </div>
              </div>

              {/* floating stats card */}
              <div className="hidden md:flex absolute -bottom-10 -right-6 lg:-right-12 w-56 bg-jet border border-gold/30 px-6 py-5 flex-col gap-3 shadow-[0_30px_60px_-20px_oklch(0_0_0/0.8)]">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl text-gold leading-none">100%</span>
                </div>
                <div className="text-[10px] tracking-[0.3em] uppercase text-cream/55 leading-relaxed">
                  Persönliche<br />Übergabe in Mannheim
                </div>
                <span aria-hidden className="h-px w-8 bg-gold/60" />
              </div>
            </div>
          </div>

          {/* TEXT COLUMN */}
          <div className="lg:col-span-6 space-y-7 text-cream/70 font-light text-lg leading-relaxed">
            <div className="flex items-center gap-3 mb-2">
              <span className="h-px w-10 bg-gold/60" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-gold/80">Unsere Geschichte</span>
            </div>
            <p className="text-cream font-display text-3xl md:text-4xl leading-tight">
              {t.about.intro} <span className="italic text-gold/90">{t.about.introItalic}</span>
            </p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
            <div className="flex items-center gap-4 pt-6">
              <span className="h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent" />
              <p className="text-xs tracking-[0.3em] uppercase text-gold whitespace-nowrap">
                {t.about.founders}
              </p>
            </div>
          </div>
        </div>
      </section>

    </SiteLayout>
  );
}
