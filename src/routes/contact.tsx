import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Concierge kontaktieren — OBRENT" },
      { name: "description", content: "Sprechen Sie mit einem OBRENT-Concierge, um ein privates Fahrerlebnis in Monaco, Paris oder Dubai zu gestalten." },
      { property: "og:title", content: "Concierge kontaktieren — OBRENT" },
      { property: "og:description", content: "Eine Einladung, ein Gespräch zu beginnen." },
    ],
  }),
  component: ContactPage,
});

const offices = [
  { city: "Mannheim", line1: "Käferthaler Straße 40", line2: "68167 Mannheim", phone: "+49 621 000 000" },
];

function ContactPage() {
  const { t } = useI18n();
  const f = t.contact.form;
  return (
    <SiteLayout>
      <section className="pt-40 pb-16 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">{t.contact.eyebrow}</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-cream leading-[0.95]">
            {t.contact.title} <span className="italic text-gold/90 font-light">{t.contact.titleItalic}</span>.
          </h1>
          <p className="mt-8 text-lg text-cream/60 font-light max-w-2xl leading-relaxed">
            {t.contact.lead}
          </p>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
            >
              <div>
                <label className="lux-label">{f.salutation}</label>
                <input className="lux-input" type="text" placeholder={f.salutationPlaceholder} />
              </div>
              <div>
                <label className="lux-label">{f.name}</label>
                <input className="lux-input" type="text" placeholder="Jonathan Beaumont" />
              </div>
              <div>
                <label className="lux-label">{f.email}</label>
                <input className="lux-input" type="email" placeholder="jonathan@residenz.de" />
              </div>
              <div>
                <label className="lux-label">{f.phone}</label>
                <input className="lux-input" type="tel" placeholder="+49 30 00 00 00" />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.subject}</label>
                <input className="lux-input" type="text" placeholder={f.subjectPlaceholder} />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.message}</label>
                <textarea className="lux-input resize-none" rows={6} placeholder={f.messagePlaceholder} />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="btn-gold">{f.submit}</button>
                <p className="mt-6 text-xs text-cream/40">
                  {f.confidential}
                </p>
              </div>
            </form>
          </div>

          <aside className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-border space-y-12">
            <div>
              <div className="eyebrow mb-4">{t.contact.direct}</div>
              <div className="font-display text-2xl text-cream">concierge@obrent.com</div>
              <div className="mt-2 text-cream/55">+377 9777 0000</div>
            </div>
            <div className="space-y-8">
              <div className="eyebrow">{t.contact.ateliers}</div>
              {offices.map((o) => (
                <div key={o.city} className="border-l border-gold/30 pl-5">
                  <div className="font-display text-2xl text-cream mb-1">{o.city}</div>
                  <div className="text-sm text-cream/60 font-light">{o.line1}</div>
                  <div className="text-sm text-cream/60 font-light">{o.line2}</div>
                  <div className="text-sm text-gold/80 mt-2">{o.phone}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
