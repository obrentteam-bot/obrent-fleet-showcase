import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Über uns — OBRENT Mannheim" },
      { name: "description", content: "OBRENT — Luxus-Autovermietung aus Mannheim. Premium-Fahrzeuge von Porsche, BMW und Audi zu fairen Preisen, persönlich übergeben." },
      { property: "og:title", content: "Über uns — OBRENT Mannheim" },
      { property: "og:description", content: "Premium-Fahrzeuge zur Miete in Mannheim. Fair, persönlich, schnell verfügbar." },
    ],
  }),
  component: AboutPage,
});

const aboutImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85";

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

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden bg-jet">
              <img src={aboutImage} alt="Ein klassisches Fahrzeug in der Abenddämmerung" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:pl-8 space-y-6 text-cream/70 font-light text-lg leading-relaxed">
            <p className="text-cream font-display text-3xl md:text-4xl leading-tight">
              {t.about.intro} <span className="italic text-gold/90">{t.about.introItalic}</span>
            </p>
            <p>{t.about.p2}</p>
            <p>{t.about.p3}</p>
            <p className="pt-4 text-sm tracking-[0.18em] uppercase text-gold">
              {t.about.founders}
            </p>
          </div>
        </div>
      </section>

    </SiteLayout>
  );
}
