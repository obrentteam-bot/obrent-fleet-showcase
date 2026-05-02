import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { vehicles, categories, formatPrice, VehicleCategory } from "@/lib/vehicles";

export const Route = createFileRoute("/fleet/")({
  head: () => ({
    meta: [
      { title: "The Fleet — OBRENT" },
      { name: "description", content: "Browse the OBRENT collection of luxury sedans, SUVs, sports cars, and convertibles available by reservation." },
      { property: "og:title", content: "The Fleet — OBRENT" },
      { property: "og:description", content: "Sedans, SUVs, sports cars, and convertibles — privately curated for discerning travellers." },
    ],
  }),
  component: FleetPage,
});

function FleetPage() {
  const [active, setActive] = useState<VehicleCategory | "All">("All");

  const filtered = active === "All" ? vehicles : vehicles.filter((v) => v.category === active);

  return (
    <SiteLayout>
      <section className="pt-40 pb-16 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="gold-rule" />
            <span className="eyebrow">The Collection</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-cream leading-[0.95] max-w-4xl">
            Our <span className="italic text-gold/90 font-light">fleet</span>
          </h1>
          <p className="mt-8 text-lg text-cream/60 font-light max-w-2xl leading-relaxed">
            Each motorcar is reserved exclusively for OBRENT clientele — maintained, prepared, and presented to a standard the marque itself would recognise.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="px-6 md:px-12 sticky top-20 z-30 bg-onyx/85 backdrop-blur-xl border-y border-border">
        <div className="max-w-[1440px] mx-auto py-5 flex items-center gap-2 md:gap-8 overflow-x-auto">
          <span className="eyebrow shrink-0 hidden md:inline">Filter</span>
          {(["All", ...categories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 text-[0.7rem] tracking-[0.28em] uppercase px-1 py-2 border-b transition-colors ${
                active === c
                  ? "text-gold border-gold"
                  : "text-cream/55 border-transparent hover:text-cream"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto eyebrow text-cream/40 hidden md:inline">{filtered.length} motorcars</span>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((v) => (
            <div key={v.id} className="glass-card group flex flex-col">
              <Link
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                className="relative aspect-[4/3] overflow-hidden bg-jet block"
              >
                <img
                  src={v.image}
                  alt={v.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx/70 via-transparent" />
                <div className="absolute top-5 left-5 eyebrow text-cream/70">{v.category}</div>
              </Link>
              <div className="p-8 flex flex-col flex-1">
                <div className="text-xs tracking-[0.28em] uppercase text-cream/45 mb-2">{v.marque}</div>
                <h3 className="font-display text-2xl text-cream mb-3">{v.name}</h3>
                <p className="text-sm text-cream/55 font-light italic mb-6 flex-1">{v.tagline}</p>
                <div className="flex items-end justify-between pt-6 border-t border-border">
                  <div>
                    <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/40 mb-1">From</div>
                    <div className="font-display text-xl text-gold">{formatPrice(v.pricePerDay)}<span className="text-sm text-cream/40 ml-1">/day</span></div>
                  </div>
                  <Link
                    to="/fleet/$vehicleId"
                    params={{ vehicleId: v.id }}
                    className="text-xs tracking-[0.28em] uppercase text-cream hover:text-gold transition border-b border-cream/40 hover:border-gold pb-1"
                  >
                    Reserve
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
