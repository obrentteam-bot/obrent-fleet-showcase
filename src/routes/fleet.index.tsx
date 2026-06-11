import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight } from "lucide-react";
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

  const filtered = active === "All" 
    ? [...vehicles].sort((a, b) => b.pricePerDay - a.pricePerDay) 
    : vehicles.filter((v) => v.category === active);

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

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          {loading && (
            <div className="text-center text-cream/50 py-20">{t.common.filter}…</div>
          )}

          {/* Featured hero card */}
          {!loading && filtered[0] && (
            <Link
              to="/fleet/$vehicleId"
              params={{ vehicleId: filtered[0].id }}
              className="relative block group rounded-2xl overflow-hidden bg-jet border border-border mb-8 aspect-[21/10]"
            >
              {filtered[0].hasImages ? (
                <img
                  src={filtered[0].image}
                  alt={filtered[0].name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                />
              ) : (
                <ImagePlaceholder className="absolute inset-0 w-full h-full" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/70 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-between max-w-[60%]">
                <div>
                  <div className="eyebrow text-cream/70 mb-4">{filtered[0].marque}</div>
                  <h2 className="font-display text-4xl md:text-6xl text-cream leading-[0.95]">{filtered[0].name}</h2>
                </div>
                <div>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                      <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Motor</dt>
                      <dd className="text-cream/90 font-light mt-1 text-sm">{filtered[0].specs.engine}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Leistung</dt>
                      <dd className="text-cream/90 font-light mt-1 text-sm">{filtered[0].specs.power}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Baujahr</dt>
                      <dd className="text-cream/90 font-light mt-1 text-sm">{filtered[0].year}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">Farbe</dt>
                      <dd className="text-cream/90 font-light mt-1 text-sm">{filtered[0].color}</dd>
                    </div>
                  </dl>
                  <div className="flex items-center gap-6 flex-wrap">
                    <span className="bg-gold/95 text-onyx px-6 py-3 text-xs tracking-[0.28em] uppercase font-medium">
                      {t.common.reserve}
                    </span>
                    <div>
                      <div className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/40">{t.common.from}</div>
                      <div className="font-display text-2xl text-gold">{formatPrice(filtered[0].pricePerDay)}<span className="text-xs text-cream/40 ml-1">{t.common.perDay}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(1).map((v) => (
              <Link
                key={v.id}
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                className="group flex flex-col rounded-xl overflow-hidden bg-jet border border-border hover:border-gold/40 transition-colors"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-jet">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 text-[0.6rem] tracking-[0.28em] uppercase text-cream/85 bg-onyx/60 backdrop-blur-sm px-3 py-1.5 rounded">
                    {cats[v.category] ?? v.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/45 mb-1">{v.marque}</div>
                  <h3 className="font-display text-xl text-cream mb-5">{v.name}</h3>
                  <dl className="grid grid-cols-4 gap-3 mb-6">
                    <div>
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Motor</dt>
                      <dd className="text-cream/85 font-light mt-1 text-[0.7rem] leading-tight">{v.specs.engine}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Leistung</dt>
                      <dd className="text-cream/85 font-light mt-1 text-[0.7rem] leading-tight">{v.specs.power}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Baujahr</dt>
                      <dd className="text-cream/85 font-light mt-1 text-[0.7rem] leading-tight">{v.year}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Farbe</dt>
                      <dd className="text-cream/85 font-light mt-1 text-[0.7rem] leading-tight">{v.color}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex items-end justify-between pt-5 border-t border-border">
                    <div>
                      <div className="text-[0.6rem] tracking-[0.28em] uppercase text-cream/40 mb-1">{t.common.from}</div>
                      <div className="font-display text-lg text-gold">{formatPrice(v.pricePerDay)}<span className="text-xs text-cream/40 ml-1">{t.common.perDay}</span></div>
                    </div>
                    <span className="text-[0.65rem] tracking-[0.28em] uppercase text-cream group-hover:text-gold transition inline-flex items-center gap-2">
                      {t.common.reserve} <span aria-hidden>→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
