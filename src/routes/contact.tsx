import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the Concierge — OBRENT" },
      { name: "description", content: "Speak with an OBRENT concierge to compose a private motoring engagement in Monaco, Paris, or Dubai." },
      { property: "og:title", content: "Contact the Concierge — OBRENT" },
      { property: "og:description", content: "An invitation to begin a conversation." },
    ],
  }),
  component: ContactPage,
});

const offices = [
  { city: "Monaco", line1: "Avenue Princesse Grace", line2: "98000 Monaco", phone: "+377 9777 0000" },
  { city: "Paris", line1: "8 Avenue Montaigne", line2: "75008 Paris", phone: "+33 1 44 00 00 00" },
  { city: "Dubai", line1: "DIFC, Gate Village 4", line2: "United Arab Emirates", phone: "+971 4 000 0000" },
];

function ContactPage() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-16 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">An Invitation</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-cream leading-[0.95]">
            Begin a <span className="italic text-gold/90 font-light">conversation</span>.
          </h1>
          <p className="mt-8 text-lg text-cream/60 font-light max-w-2xl leading-relaxed">
            Whether for an afternoon in the Alpes-Maritimes or a season abroad, our concierge will compose an engagement entirely to your requirements.
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
                <label className="lux-label">Salutation</label>
                <input className="lux-input" type="text" placeholder="Mr. / Mme. / Dr." />
              </div>
              <div>
                <label className="lux-label">Full Name</label>
                <input className="lux-input" type="text" placeholder="Jonathan Beaumont" />
              </div>
              <div>
                <label className="lux-label">Email</label>
                <input className="lux-input" type="email" placeholder="jonathan@residence.com" />
              </div>
              <div>
                <label className="lux-label">Telephone</label>
                <input className="lux-input" type="tel" placeholder="+33 6 00 00 00 00" />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">Subject</label>
                <input className="lux-input" type="text" placeholder="A private weekend in Monaco" />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">Your Message</label>
                <textarea className="lux-input resize-none" rows={6} placeholder="Kindly share the details of your enquiry…" />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="btn-gold">Send Enquiry</button>
                <p className="mt-6 text-xs text-cream/40">
                  Your enquiry is treated in strict confidence. We respond personally within the hour.
                </p>
              </div>
            </form>
          </div>

          <aside className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-border space-y-12">
            <div>
              <div className="eyebrow mb-4">Direct</div>
              <div className="font-display text-2xl text-cream">concierge@obrent.com</div>
              <div className="mt-2 text-cream/55">+377 9777 0000</div>
            </div>
            <div className="space-y-8">
              <div className="eyebrow">Ateliers</div>
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
