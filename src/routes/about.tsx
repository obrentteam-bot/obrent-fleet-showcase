import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "The House of OBRENT — About" },
      { name: "description", content: "Founded in Monaco in 2012, OBRENT is a private atelier of motoring, devoted to discretion, provenance and the pursuit of the extraordinary." },
      { property: "og:title", content: "The House of OBRENT" },
      { property: "og:description", content: "Founded in Monaco. Devoted to discretion, provenance and the pursuit of the extraordinary." },
    ],
  }),
  component: AboutPage,
});

const aboutImage = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=85";

const values = [
  {
    numeral: "I",
    title: "Provenance",
    body: "Each motorcar is acquired from sources of impeccable lineage — recorded, verified, and presented with full history.",
  },
  {
    numeral: "II",
    title: "Discretion",
    body: "Our clientele's privacy is not a policy but a principle. Names are never spoken; itineraries never shared.",
  },
  {
    numeral: "III",
    title: "Mastery",
    body: "Our technicians are factory-trained. Our preparation is forensic. Nothing leaves the atelier short of perfection.",
  },
  {
    numeral: "IV",
    title: "Hospitality",
    body: "We attend to clients as we would receive them in our own home — with warmth, with patience, with care.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="pt-40 pb-24 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">The House of OBRENT</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-cream leading-[0.95]">
            A private atelier of <span className="italic text-gold/90 font-light">motoring</span>.
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden bg-jet">
              <img src={aboutImage} alt="A vintage motorcar at dusk" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:pl-8 space-y-6 text-cream/70 font-light text-lg leading-relaxed">
            <p className="text-cream font-display text-3xl md:text-4xl leading-tight">
              Founded in Monaco in 2012, OBRENT was conceived for a quiet question — <span className="italic text-gold/90">where might one borrow a Phantom for a single afternoon?</span>
            </p>
            <p>
              In the years that followed, that question became a vocation. We assembled a small fleet of extraordinary motorcars and offered them, by introduction, to a small number of clients. We did not advertise. We did not need to.
            </p>
            <p>
              Today the atelier operates from Monaco, Paris, and Dubai. The clientele has grown — modestly, deliberately — and the principles remain unchanged. We treat every motorcar as a guest in our care, and every client as the next chapter in a long story.
            </p>
            <p className="pt-4 text-sm tracking-[0.18em] uppercase text-gold">
              — The Founders
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-12 bg-jet/40 border-y border-border">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="gold-rule" />
              <span className="eyebrow">Our Values</span>
              <span className="gold-rule" />
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-cream">
              Four <span className="italic text-gold/90 font-light">principles</span>, four cornerstones.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {values.map((v) => (
              <div key={v.numeral} className="bg-onyx p-12 md:p-16">
                <div className="font-display text-7xl text-gold/60 italic mb-6">{v.numeral}</div>
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
