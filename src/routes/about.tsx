import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import heroSunset from "@/assets/about-hero-sunset.png";
import { Users, Handshake, Crown, ArrowRight, Car, MapPin, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  const STAT_ICONS = [Car, MapPin, Star];
  const VALUE_ICONS = [Users, Handshake, Crown];

  return (
    <SiteLayout>
      {/* SECTION 1 — HERO */}
      <Section className="relative min-h-[100svh] pt-24 md:pt-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSunset}
            alt="OBRENT Premium Fleet bei Sonnenuntergang"
            className="w-full h-full object-cover object-center"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-white/30 dark:bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-white/40 dark:from-transparent dark:via-black/20 dark:to-black/80" />
        </div>
        <div className="relative max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center min-h-[calc(100svh-6rem)] py-16">
          <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold mb-6">
            {t.about.eyebrow}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-onyx dark:text-cream leading-[0.95] max-w-4xl">
            {t.about.headline1}<br />
            {t.about.headline2}<br />
            <span className="text-gold italic font-light">{t.about.headlineItalic}</span>
          </h1>
          <p className="mt-6 md:mt-8 text-base md:text-lg text-onyx/80 dark:text-cream/75 font-light max-w-2xl leading-relaxed">
            {t.about.intro}
          </p>
        </div>
      </Section>

      {/* SECTION 2 — STORY + STATS */}
      <Section className="bg-background py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto w-full px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem]">{t.about.historyEyebrow}</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-5 leading-[1.05] text-foreground">
                {t.about.historyTitle}<br />
                <span className="text-gold italic font-light">{t.about.historyTitleItalic}</span>
              </h2>
              <div className="mt-8 hidden lg:block h-32 w-px bg-gradient-to-b from-gold/60 to-transparent" />
            </div>

            <div className="lg:col-span-7 space-y-5 text-foreground/75 text-base md:text-lg leading-[1.85] font-light">
              <p>{t.about.historyP1}</p>
              <p>{t.about.historyP2}</p>

              <div className="grid grid-cols-3 gap-4 md:gap-6 pt-8">
                {t.about.stats.map(({ value, label }, i) => {
                  const Icon = STAT_ICONS[i];
                  return (
                    <div key={label} className="flex flex-col items-center text-center">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-gold mb-4" strokeWidth={1.5} />
                      <div className="font-display text-2xl md:text-4xl text-foreground mb-2">{value}</div>
                      <div className="text-[0.6rem] md:text-[0.65rem] tracking-[0.28em] uppercase text-muted-foreground leading-relaxed">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 3 — VALUES */}
      <Section className="bg-muted/30 py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto w-full px-6 md:px-12">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem]">{t.about.valuesEyebrow}</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-5 text-foreground">{t.about.valuesTitle}</h2>
            <div className="mx-auto mt-6 h-px w-14 bg-gold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
            {t.about.values.map(({ title, body }, i) => {
              const Icon = VALUE_ICONS[i];
              return (
                <div
                  key={title}
                  className="group text-center p-7 md:p-10 rounded-2xl border border-border bg-card/60 hover:border-gold/40 transition-colors"
                >
                  <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-full border border-gold/40 flex items-center justify-center mb-6 transition-colors group-hover:border-gold group-hover:bg-gold/5">
                    <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl tracking-wide mb-3 text-foreground">{title}</h3>
                  <p className="text-muted-foreground font-light text-sm md:text-[0.95rem] leading-[1.8]">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* SECTION 4 — CTA */}
      <Section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroSunset}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-30 dark:opacity-25"
          />
          <div className="absolute inset-0 bg-white/40 dark:bg-onyx/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent dark:from-onyx dark:via-onyx/80 dark:to-onyx/30" />
        </div>
        <div className="relative max-w-[1280px] mx-auto w-full px-6 md:px-12">
          <div className="max-w-2xl">
            <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem] mb-6">
              {t.about.ctaEyebrow}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-foreground">
              {t.about.ctaTitle}<br />
              <span className="text-gold italic font-light">{t.about.ctaTitleItalic}</span>
            </h2>
            <p className="mt-6 text-foreground/75 text-base md:text-lg font-light">
              {t.about.ctaLead}
            </p>
            <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/fleet"
                className="group inline-flex items-center gap-3 bg-gold text-cream px-7 py-4 text-xs tracking-[0.28em] uppercase font-medium hover:bg-gold/90 transition-colors"
              >
                {t.about.ctaFleet}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 border border-foreground/30 text-foreground px-7 py-4 text-xs tracking-[0.28em] uppercase font-medium hover:border-gold hover:text-gold transition-colors"
              >
                {t.about.ctaContact}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}

function Section({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={className}>{children}</section>;
}
