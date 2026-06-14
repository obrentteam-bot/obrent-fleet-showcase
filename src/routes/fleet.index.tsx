import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight, Cog, Gauge, CalendarDays, Palette } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/vehicles";
import { useVehicles } from "@/lib/useVehicles";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import ferrariHero from "@/assets/ferrari-hauptcover.png.asset.json";


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
  const { theme } = useTheme();
  const isLight = theme === "light";
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
        <div className="max-w-[1440px] mx-auto py-5 relative">
          <div className="flex items-center gap-2 md:gap-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x pr-10 md:pr-0">
            <span className="eyebrow shrink-0 hidden md:inline">{t.common.filter}</span>
            {(["All", ...dynamicCategories]).map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`shrink-0 snap-start text-[0.7rem] tracking-[0.28em] uppercase px-1 py-2 border-b transition-colors ${
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
          <div className="md:hidden pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-onyx to-transparent" />
        </div>
      </section>

      <section className="py-16 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          {loading && (
            <div className="text-center text-cream/50 py-20">{t.common.filter}…</div>
          )}

          {/* Featured hero card */}
          {!loading && filtered[0] && (() => {
            const v = filtered[0];
            const isFerrari = /ferrari/i.test(v.marque) || /ferrari/i.test(v.name);
            const heroImg = isFerrari ? ferrariHero.url : v.image;
            const tagline = isFerrari
              ? "Ikonischer V12-Gran-Turismo mit kompromissloser Ferrari-Präsenz."
              : v.tagline ?? "";
            return (
              <Link
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                className="hidden md:grid relative group rounded-2xl overflow-hidden border border-border mb-8 grid-cols-[minmax(0,34%)_minmax(0,66%)] min-h-[460px]"
                style={{ background: isLight ? "#F5F0E8" : "#0A0A0A" }}
              >
                {/* LEFT — info */}
                <div
                  className="relative z-10 p-10 lg:p-12 flex flex-col justify-between"
                  style={{ background: isLight ? "#F5F0E8" : "#0A0A0A" }}
                >
                  <div>
                    <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold mb-6">{v.marque}</div>
                    <h2
                      className="font-display leading-[0.95] text-4xl lg:text-5xl xl:text-6xl"
                      style={{ color: isLight ? "#0A0A0A" : undefined }}
                    >
                      <span className={isLight ? "" : "text-cream"}>{v.name}</span>
                    </h2>
                    {tagline && (
                      <p
                        className="mt-5 font-light text-base leading-relaxed max-w-md"
                        style={{ color: isLight ? "rgba(10,10,10,0.75)" : "rgba(245,240,232,0.7)" }}
                      >{tagline}</p>
                    )}
                    <dl className="mt-8 grid grid-cols-4 gap-5">
                      {[
                        { Icon: Cog, label: "Motor", val: v.specs.engine },
                        { Icon: Gauge, label: "Leistung", val: v.specs.power },
                        { Icon: CalendarDays, label: "Baujahr", val: String(v.year) },
                        { Icon: Palette, label: "Farbe", val: v.color },
                      ].map(({ Icon, label, val }) => (
                        <div key={label} className="min-w-0">
                          <Icon className="w-4 h-4 text-gold mb-2" strokeWidth={1.2} />
                          <dt
                            className="text-[0.55rem] tracking-[0.26em] uppercase"
                            style={{ color: isLight ? "rgba(10,10,10,0.55)" : "rgba(245,240,232,0.45)" }}
                          >{label}</dt>
                          <dd
                            className="font-medium mt-1 text-xs leading-snug truncate"
                            style={{ color: isLight ? "#0A0A0A" : "#F5F0E8" }}
                          >{val}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div
                    className="mt-10 pt-6 flex items-end gap-6 flex-wrap"
                    style={{ borderTop: isLight ? "1px solid rgba(10,10,10,0.12)" : "1px solid rgba(245,240,232,0.1)" }}
                  >
                    <div>
                      <div
                        className="text-[0.55rem] tracking-[0.28em] uppercase mb-1"
                        style={{ color: isLight ? "rgba(10,10,10,0.55)" : "rgba(245,240,232,0.4)" }}
                      >AB</div>
                      <div className="font-display text-2xl italic" style={{ color: "#B8975A" }}>Preis auf Anfrage</div>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-3 border border-gold/70 bg-gold/10 text-gold px-7 py-3.5 text-[0.7rem] tracking-[0.32em] uppercase font-medium hover:bg-gold hover:text-onyx transition rounded-sm">
                      Jetzt anfragen
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* RIGHT — image */}
                <div
                  className="relative overflow-hidden"
                  style={{ background: isLight ? "#F5F0E8" : "#0A0A0A" }}
                >
                  {(isFerrari || v.hasImages) ? (
                    <img
                      src={heroImg}
                      alt={v.name}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-jet">
                      <span className="text-[#B8975A] text-sm tracking-[0.2em] uppercase font-light">Bilder folgen in Kürze</span>
                    </div>
                  )}
                  {!isFerrari && (
                    <div
                      className="absolute inset-y-0 left-0 w-32"
                      style={{ background: `linear-gradient(to right, ${isLight ? "#F5F0E8" : "#0A0A0A"}, transparent)` }}
                    />
                  )}
                </div>
              </Link>
            );
          })()}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v, idx) => (
              <Link
                key={v.id}
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                className={`group flex flex-col rounded-xl overflow-hidden bg-jet border border-border hover:border-gold/40 transition-colors ${idx === 0 ? "md:hidden" : ""}`}
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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[#B8975A] text-sm tracking-[0.2em] uppercase font-light">Bilder folgen in Kürze</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 text-[0.6rem] tracking-[0.28em] uppercase text-cream/85 bg-onyx/60 backdrop-blur-sm px-3 py-1.5 rounded">
                    {cats[v.category] ?? v.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/45 mb-1">{v.marque}</div>
                  <h3 className="font-display text-xl text-cream mb-5">{v.name}</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
                    <div className="min-w-0">
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Motor</dt>
                      <dd className="text-cream/85 font-light mt-1 text-xs leading-snug">{v.specs.engine}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Leistung</dt>
                      <dd className="text-cream/85 font-light mt-1 text-xs leading-snug">{v.specs.power}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Baujahr</dt>
                      <dd className="text-cream/85 font-light mt-1 text-xs leading-snug">{v.year}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[0.55rem] tracking-[0.22em] uppercase text-cream/40">Farbe</dt>
                      <dd className="text-cream/85 font-light mt-1 text-xs leading-snug">{v.color}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto pt-5 border-t border-border flex items-end justify-between gap-4">
                    <div>
                      <div className="font-display text-base italic" style={{ color: "#B8975A" }}>Preis auf Anfrage</div>
                    </div>
                    <span className="inline-flex items-center gap-2 border border-gold text-gold px-5 py-2.5 text-[0.65rem] tracking-[0.28em] uppercase font-medium group-hover:bg-gold group-hover:text-onyx transition rounded-full">
                      {t.common.reserve}
                      <ArrowRight className="w-3.5 h-3.5" />
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
