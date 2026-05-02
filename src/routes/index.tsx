import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { vehicles, formatPrice } from "@/lib/vehicles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OBRENT — Curated Luxury Motoring" },
      { name: "description", content: "OBRENT offers a discreet, hand-selected fleet of the world's most exceptional automobiles, available by appointment in Monaco, Paris and Dubai." },
      { property: "og:title", content: "OBRENT — Curated Luxury Motoring" },
      { property: "og:description", content: "An invitation to the extraordinary. Hand-selected motorcars, delivered to you." },
    ],
  }),
  component: HomePage,
});

const heroImage = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2400&q=85";

const usps = [
  {
    title: "Concierge Delivery",
    body: "Your motorcar arrives at your residence, hotel, or private terminal — fully prepared and impeccably presented.",
    numeral: "I",
  },
  {
    title: "Hand-Selected Fleet",
    body: "Every vehicle is privately curated, maintained by marque specialists, and reserved for a discerning few.",
    numeral: "II",
  },
  {
    title: "Discretion Assured",
    body: "Your reservation, your itinerary, your privacy — protected by an unwritten code we have observed for decades.",
    numeral: "III",
  },
];

function HomePage() {
  const featured = vehicles.slice(0, 3);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative h-screen min-h-[720px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/70 via-onyx/40 to-onyx" />
        <div className="absolute inset-0 bg-onyx/30" />

        <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center">
          <div className="max-w-3xl fade-up">
            <div className="flex items-center gap-4 mb-8">
              <span className="gold-rule" />
              <span className="eyebrow">Est. Monaco · MMXII</span>
            </div>
            <h1 className="font-display text-[15vw] md:text-[10rem] leading-[0.9] text-cream tracking-tight">
              OB<span className="text-gold italic font-light">rent</span>
            </h1>
            <p className="mt-10 text-lg md:text-xl text-cream/75 font-light max-w-xl leading-relaxed">
              An assembly of the world's most extraordinary motorcars — offered, by invitation, to those who recognise the difference.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link to="/fleet" className="btn-gold">Discover Our Fleet</Link>
              <Link to="/contact" className="btn-ghost">Private Appointment</Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-6 md:left-12 right-6 md:right-12 flex items-end justify-between text-cream/50">
            <div className="text-xs tracking-[0.3em] uppercase">Scroll</div>
            <div className="hidden md:block text-xs tracking-[0.3em] uppercase">
              43.7384° N · 7.4246° E
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED FLEET */}
      <section className="py-32 md:py-40 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="gold-rule" />
                <span className="eyebrow">The Collection</span>
              </div>
              <h2 className="font-display text-5xl md:text-7xl text-cream leading-[1] max-w-2xl">
                Featured <span className="italic text-gold/90 font-light">motorcars</span>
              </h2>
            </div>
            <Link to="/fleet" className="text-[0.7rem] tracking-[0.3em] uppercase text-gold border-b border-gold/40 pb-1 hover:border-gold transition self-start md:self-auto">
              View Entire Fleet →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((v, i) => (
              <Link
                key={v.id}
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                className="glass-card group overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-jet">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent" />
                  <div className="absolute top-5 left-5 eyebrow text-cream/70">{v.category}</div>
                </div>
                <div className="p-8">
                  <div className="text-xs tracking-[0.28em] uppercase text-cream/45 mb-2">{v.marque}</div>
                  <h3 className="font-display text-3xl text-cream mb-4">{v.name}</h3>
                  <p className="text-sm text-cream/55 font-light italic mb-6">{v.tagline}</p>
                  <div className="flex items-end justify-between pt-6 border-t border-border">
                    <div>
                      <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/40 mb-1">From</div>
                      <div className="font-display text-2xl text-gold">{formatPrice(v.pricePerDay)}<span className="text-sm text-cream/40 ml-1">/day</span></div>
                    </div>
                    <span className="text-xs tracking-[0.28em] uppercase text-cream/60 group-hover:text-gold transition">Reserve →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* USPS */}
      <section className="py-32 md:py-40 px-6 md:px-12 bg-jet/40 border-y border-border">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="gold-rule" />
              <span className="eyebrow">The OBRENT Standard</span>
              <span className="gold-rule" />
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-cream max-w-3xl mx-auto leading-tight">
              Three <span className="italic text-gold/90 font-light">tenets</span>, observed without compromise.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {usps.map((u) => (
              <div key={u.numeral} className="bg-onyx p-12 md:p-14">
                <div className="font-display text-7xl text-gold/60 italic mb-8">{u.numeral}</div>
                <h3 className="font-display text-2xl text-cream mb-4">{u.title}</h3>
                <p className="text-sm text-cream/60 font-light leading-relaxed">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVITATION */}
      <section className="py-32 md:py-40 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="eyebrow mb-8">By Invitation</div>
          <h2 className="font-display text-4xl md:text-6xl text-cream leading-[1.1] mb-10">
            Some journeys deserve <span className="italic text-gold/90 font-light">more than a vehicle</span>.
          </h2>
          <p className="text-lg text-cream/60 font-light mb-12 leading-relaxed">
            Speak with our concierge to compose a motoring experience tailored to your itinerary, your taste, and your timetable.
          </p>
          <Link to="/contact" className="btn-gold">Begin a Conversation</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
