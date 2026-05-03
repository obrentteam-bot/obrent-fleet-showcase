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
      {/* CINEMATIC HERO with full-bleed Wasserturm */}
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        {/* Background image */}
        <img
          src={aboutImage}
          alt="Mannheimer Wasserturm zur blauen Stunde"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        {/* Cinematic overlays */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,transparent_0%,oklch(0.10_0_0/0.55)_50%,oklch(0.08_0_0/0.92)_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.08_0_0/0.85)_0%,transparent_25%,transparent_60%,oklch(0.08_0_0/0.95)_100%)]"
        />
        {/* Subtle grain / vignette */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,oklch(0_0_0/0.6)_100%)]"
        />

        {/* Top eyebrow row */}
        <div className="relative z-10 pt-40 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto flex items-center gap-4">
            <span className="gold-rule" />
            <span className="eyebrow">{t.about.eyebrowHouse}</span>
          </div>
        </div>

        {/* Giant transparent overlay title */}
        <div className="relative z-10 px-6 md:px-12 mt-12 md:mt-20">
          <div className="max-w-[1440px] mx-auto">
            <h1 className="font-display text-7xl sm:text-8xl md:text-[10rem] lg:text-[14rem] xl:text-[17rem] leading-[0.85] tracking-tight text-cream/95 mix-blend-screen drop-shadow-[0_8px_40px_oklch(0_0_0/0.6)]">
              {t.about.title}
              <br />
              <span className="italic font-light text-gold">
                {t.about.titleItalic}.
              </span>
            </h1>
          </div>
        </div>

        {/* Vertical side caption */}
        <div
          aria-hidden
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-6 text-[10px] tracking-[0.5em] uppercase text-cream/50"
        >
          <span>49°29′N</span>
          <span className="h-24 w-px bg-cream/30" />
          <span className="[writing-mode:vertical-rl] rotate-180">
            Mannheim · Est MMXXVI
          </span>
          <span className="h-24 w-px bg-cream/30" />
          <span>08°28′E</span>
        </div>

        {/* Bottom: image credit / scroll cue */}
        <div className="absolute bottom-8 left-0 right-0 z-10 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto flex items-end justify-between gap-6">
            <div className="text-[10px] tracking-[0.4em] uppercase text-cream/55">
              Wasserturm <span className="text-gold/80">·</span> Heimat von OBRENT
            </div>
            <div className="hidden md:flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase text-cream/55">
              <span>Scroll</span>
              <span className="h-px w-12 bg-gold/60" />
            </div>
          </div>
        </div>
      </section>

      {/* STORY section */}
      <section className="relative px-6 md:px-12 py-32">
        {/* huge faded backdrop numeral */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 left-0 right-0 text-center font-display text-[20rem] md:text-[32rem] leading-none text-gold/[0.035] select-none"
        >
          OB
        </div>

        <div className="max-w-[1100px] mx-auto relative">
          <div className="flex items-center gap-3 mb-10">
            <span className="h-px w-12 bg-gold/70" />
            <span className="text-[10px] tracking-[0.4em] uppercase text-gold">
              Unsere Geschichte
            </span>
          </div>

          <p className="text-cream font-display text-3xl md:text-5xl leading-tight max-w-4xl">
            {t.about.intro}{" "}
            <span className="italic text-gold/90 font-light">
              {t.about.introItalic}
            </span>
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 text-cream/70 font-light text-lg leading-relaxed">
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
          </div>

          <div className="flex items-center gap-4 pt-20">
            <span className="h-px flex-1 bg-gradient-to-r from-gold/60 to-transparent" />
            <p className="text-xs tracking-[0.35em] uppercase text-gold whitespace-nowrap">
              {t.about.founders}
            </p>
            <span className="h-px flex-1 bg-gradient-to-l from-gold/60 to-transparent" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
