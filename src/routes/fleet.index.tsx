import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/vehicles";
import { useVehicles } from "@/lib/useVehicles";
import { useI18n } from "@/lib/i18n";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export const Route = createFileRoute("/fleet/")({
  head: () => ({
    meta: [
      { title: "Die Flotte — OBRENT" },
      { name: "description", content: "Entdecken Sie die OBRENT-Kollektion aus Luxuslimousinen, SUVs, Sportwagen und Cabriolets — auf Reservierung verfügbar." },
      { property: "og:title", content: "Die Flotte — OBRENT" },
      { property: "og:description", content: "Limousinen, SUVs, Sportwagen und Cabriolets — privat kuratiert für anspruchsvolle Reisende." },
    ],
  }),
  component: FleetPage,
});

function FleetPage() {
  const { t } = useI18n();
  const { vehicles, loading } = useVehicles();
  const [active, setActive] = useState<string>("All");
  const cats = t.categories as Record<string, string>;

  const dynamicCategories = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.category))),
    [vehicles]
  );

  const filtered = active === "All" ? vehicles : vehicles.filter((v) => v.category === active);

  return (
    <SiteLayout>
      <section className="pt-40 pb-16 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="gold-rule" />
            <span className="eyebrow">{t.fleet.eyebrow}</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-cream leading-[0.95] max-w-4xl">
            {t.fleet.title} <span className="italic text-gold/90 font-light">{t.fleet.titleItalic}</span>
          </h1>
          <p className="mt-8 text-lg text-cream/60 font-light max-w-2xl leading-relaxed">
            {t.fleet.lead}
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="px-6 md:px-12 sticky top-20 z-30 bg-onyx/85 backdrop-blur-xl border-y border-border">
        <div className="max-w-[1440px] mx-auto py-5 flex items-center gap-2 md:gap-8 overflow-x-auto">
          <span className="eyebrow shrink-0 hidden md:inline">{t.common.filter}</span>
          {(["All", ...dynamicCategories]).map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 text-[0.7rem] tracking-[0.28em] uppercase px-1 py-2 border-b transition-colors ${
                active === c
                  ? "text-gold border-gold"
                  : "text-cream/55 border-transparent hover:text-cream"
              }`}
            >
              {c === "All" ? t.common.all : (cats[c] ?? c)}
            </button>
          ))}
          <span className="ml-auto eyebrow text-cream/40 hidden md:inline">{filtered.length} {t.common.motorcars}</span>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-full text-center text-cream/50 py-20">{t.common.filter}…</div>
          )}
          {filtered.map((v) => (
            <div key={v.id} className="glass-card group flex flex-col">
              <Link
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                className="relative aspect-[4/3] overflow-hidden bg-jet block"
              >
                {v.hasImages ? (
                  <img
                    src={v.image}
                    alt={v.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                  />
                ) : (
                  <ImagePlaceholder className="absolute inset-0 w-full h-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-onyx/70 via-transparent" />
                <div className="absolute top-5 left-5 eyebrow text-cream/70">{cats[v.category] ?? v.category}</div>
              </Link>
              <div className="p-8 flex flex-col flex-1">
                <div className="text-xs tracking-[0.28em] uppercase text-cream/45 mb-2">{v.marque}</div>
                <h3 className="font-display text-2xl text-cream mb-3">{v.name}</h3>
                <p className="text-sm text-cream/55 font-light italic mb-6 flex-1">{v.tagline}</p>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-6">
                  <div>
                    <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Motor</dt>
                    <dd className="text-cream/80 font-light mt-0.5">{v.specs.engine}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Leistung</dt>
                    <dd className="text-cream/80 font-light mt-0.5">{v.specs.power}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Baujahr</dt>
                    <dd className="text-cream/80 font-light mt-0.5">{v.year}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Farbe</dt>
                    <dd className="text-cream/80 font-light mt-0.5">{v.color}</dd>
                  </div>
                </dl>
                <div className="flex items-end justify-between pt-6 border-t border-border">
                  <div>
                    <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/40 mb-1">{t.common.from}</div>
                    <div className="font-display text-xl text-gold">{formatPrice(v.pricePerDay)}<span className="text-sm text-cream/40 ml-1">{t.common.perDay}</span></div>
                  </div>
                  <Link
                    to="/fleet/$vehicleId"
                    params={{ vehicleId: v.id }}
                    className="text-xs tracking-[0.28em] uppercase text-cream hover:text-gold transition border-b border-cream/40 hover:border-gold pb-1"
                  >
                    {t.common.reserve}
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
