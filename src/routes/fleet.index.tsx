import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { ArrowRight, Cog, Gauge, CalendarDays, Palette } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Link } from "@tanstack/react-router";
import { useVehicles } from "@/lib/useVehicles";
import { formatPrice } from "@/lib/vehicles";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/useSettings";

import { useTheme } from "@/lib/theme";
const ferrariHero = { url: "/ferrari-fleet-hero.png" };


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
  const { settings } = useSettings();

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
      <section className="pt-28 pb-10 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4 mb-5">
            <span className="gold-rule" />
            <span className="eyebrow">{t.fleet.eyebrow}</span>
          </div>
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

      <section className="py-10 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          {loading && (
            <div className="text-center text-cream/50 py-20">{t.common.filter}…</div>
          )}

          {/* Featured hero card */}
          {!loading && filtered[0] && (() => {
            const v = filtered[0];
            const isFerrari = /ferrari/i.test(v.marque) || /ferrari/i.test(v.name);
            const heroImg = v.image;
            const tagline = v.tagline ?? "";
            if (isFerrari) {
              return (
                <Link
                  to="/fleet/$vehicleId"
                  params={{ vehicleId: v.id }}
                  className="hidden md:block relative group rounded-[20px] overflow-hidden border border-border mb-6 min-h-[420px]"
                >
                  <div
                    className="absolute inset-0 bg-no-repeat"
                    role="img"
                    aria-label={v.name}
                    style={{
                      backgroundImage: `url(${heroImg})`,
                      backgroundSize: "150% auto",
                      backgroundPosition: "0% 50%",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/12" />
                  <div className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-black/92 via-black/72 to-transparent" />

                  <div className="relative z-10 flex min-h-[420px] max-w-[44%] flex-col justify-between p-8 lg:p-10" style={{ color: "#F5F0E8" }}>
                    <div>
                      <div className="mb-4 text-[0.7rem] uppercase tracking-[0.32em] text-gold">{v.marque}</div>
                      <h2 className="font-display text-3xl leading-[0.95] lg:text-4xl xl:text-5xl" style={{ color: "#F5F0E8" }}>
                        {v.name}
                      </h2>
                      {tagline && (
                        <p className="mt-4 max-w-md text-sm font-light leading-relaxed" style={{ color: "rgba(245,240,232,0.78)" }}>{tagline}</p>
                      )}

                      <dl className="mt-6 grid grid-cols-4 gap-4">
                        {[
                          { Icon: Cog, label: "Motor", val: v.specs.engine },
                          { Icon: Gauge, label: "Leistung", val: v.specs.power },
                          { Icon: CalendarDays, label: "Baujahr", val: String(v.year) },
                          { Icon: Palette, label: "Farbe", val: v.color },
                        ].map(({ Icon, label, val }) => (
                          <div key={label} className="min-w-0">
                            <Icon className="mb-2 h-4 w-4" strokeWidth={1.2} style={{ color: "rgba(245,240,232,0.70)" }} />
                            <dt className="text-[0.55rem] uppercase tracking-[0.26em]" style={{ color: "rgba(245,240,232,0.42)" }}>{label}</dt>
                            <dd className="mt-1 truncate text-xs font-medium leading-snug" style={{ color: "#F5F0E8" }}>{val}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="mt-8 flex flex-col items-start gap-4 border-t border-cream/10 pt-5">
                      <div>
                        <div className="mb-1 text-[0.55rem] uppercase tracking-[0.28em]" style={{ color: "rgba(245,240,232,0.45)" }}>AB</div>
                        <div className="font-display text-xl italic" style={{ color: "#B8975A" }}>{settings.show_prices && v.pricePerDay > 0 ? `${formatPrice(v.pricePerDay)} / Tag` : "Preis auf Anfrage"}</div>
                      </div>
                      <span className="inline-flex items-center gap-3 rounded-sm border border-gold/70 bg-gold/10 px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-gold transition hover:bg-gold hover:text-onyx">
                        Jetzt anfragen
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                className="hidden md:grid relative group rounded-2xl overflow-hidden border border-border mb-6 grid-cols-[minmax(0,34%)_minmax(0,66%)] min-h-[360px]"
                style={{ background: isLight ? "#F5F0E8" : "#0A0A0A" }}
              >
                {/* LEFT — info */}
                <div
                  className="relative z-10 p-8 lg:p-10 flex flex-col justify-between"
                  style={{ background: isLight ? "#F5F0E8" : "#0A0A0A" }}
                >
                  <div>
                    <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold mb-4">{v.marque}</div>
                    <h2
                      className="font-display leading-[0.95] text-3xl lg:text-4xl xl:text-5xl"
                      style={{ color: isLight ? "#0A0A0A" : undefined }}
                    >
                      <span className={isLight ? "" : "text-cream"}>{v.name}</span>
                    </h2>
                    {tagline && (
                      <p
                        className="mt-4 font-light text-sm leading-relaxed max-w-md"
                        style={{ color: isLight ? "rgba(10,10,10,0.75)" : "rgba(245,240,232,0.7)" }}
                      >{tagline}</p>
                    )}
                    <dl className="mt-6 grid grid-cols-4 gap-4">
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
                    className="mt-8 pt-5 flex flex-col items-start gap-4"
                    style={{ borderTop: isLight ? "1px solid rgba(10,10,10,0.12)" : "1px solid rgba(245,240,232,0.1)" }}
                  >
                    <div>
                      <div
                        className="text-[0.55rem] tracking-[0.28em] uppercase mb-1"
                        style={{ color: isLight ? "rgba(10,10,10,0.55)" : "rgba(245,240,232,0.4)" }}
                      >AB</div>
                      <div className="font-display text-xl italic" style={{ color: "#B8975A" }}>{settings.show_prices && v.pricePerDay > 0 ? `${formatPrice(v.pricePerDay)} / Tag` : "Preis auf Anfrage"}</div>
                    </div>
                    <span className="inline-flex items-center gap-3 border border-gold/70 bg-gold/10 text-gold px-6 py-3 text-[0.7rem] tracking-[0.32em] uppercase font-medium hover:bg-gold hover:text-onyx transition rounded-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/45 mb-1">{v.marque}</div>
                  <h3 className="font-display text-lg text-cream mb-4">{v.name}</h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
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
                  <div className="mt-auto pt-4 border-t border-border flex items-end justify-between gap-4">
                    <div>
                      <div className="font-display text-base italic" style={{ color: "#B8975A" }}>{settings.show_prices && v.pricePerDay > 0 ? `${formatPrice(v.pricePerDay)} / Tag` : "Preis auf Anfrage"}</div>
                    </div>
                    <span className="inline-flex items-center gap-2 border border-gold text-gold px-4 py-2 text-[0.65rem] tracking-[0.28em] uppercase font-medium group-hover:bg-gold group-hover:text-onyx transition rounded-full">
                      {settings.cta_reserve_label || t.common.reserve}
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
