import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Das Haus OBRENT — Über uns" },
      { name: "description", content: "Gegründet 2012 in Monaco, ist OBRENT ein privates Atelier des Motorsports — der Diskretion, Provenienz und dem Streben nach dem Außergewöhnlichen verpflichtet." },
      { property: "og:title", content: "Das Haus OBRENT" },
      { property: "og:description", content: "Gegründet in Monaco. Verpflichtet zu Diskretion, Provenienz und dem Streben nach dem Außergewöhnlichen." },
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

      <section className="py-24 md:py-32 px-6 md:px-12 bg-jet/40 border-y border-border">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="gold-rule" />
              <span className="eyebrow">{t.about.valuesEyebrow}</span>
              <span className="gold-rule" />
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-cream">
              {t.about.valuesTitle} <span className="italic text-gold/90 font-light">{t.about.valuesItalic}</span>{t.about.valuesRest}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {t.about.values.map((v, i) => (
              <div key={numerals[i]} className="bg-onyx p-12 md:p-16">
                <div className="font-display text-7xl text-gold/60 italic mb-6">{numerals[i]}</div>
                <h3 className="font-display text-3xl text-cream mb-4">{v.title}</h3>
                <p className="text-cream/60 font-light leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
