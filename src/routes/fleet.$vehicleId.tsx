import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Shield, CalendarDays, MapPin, Headphones, Cog, Gauge, Palette, ShieldCheck, ArrowRight, Share2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice, formatEuro2 } from "@/lib/vehicles";
import { useSettings } from "@/lib/useSettings";
import { useVehicle } from "@/lib/useVehicles";
import { useI18n } from "@/lib/i18n";

const VehicleReservationForm = lazy(() =>
  import("@/components/VehicleReservationForm").then((module) => ({
    default: module.VehicleReservationForm,
  }))
);


export const Route = createFileRoute("/fleet/$vehicleId")({
  head: () => ({
    meta: [
      { title: "Fahrzeug — OBRENT" },
      { name: "description", content: "Reservieren Sie ein Fahrzeug bei OBRENT." },
    ],
  }),
  component: VehicleDetailPage,
});

function NotFound() {
  const { t } = useI18n();
  return (
    <SiteLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="eyebrow mb-4">{t.vehicle.notFoundEyebrow}</div>
        <h1 className="font-display text-5xl text-cream mb-6">{t.vehicle.notFoundTitle}</h1>
        <Link to="/fleet" className="btn-gold">{t.vehicle.backToFleet}</Link>
      </div>
    </SiteLayout>
  );
}

function FeatureList({ features }: { features: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 3;
  const showToggle = features.length > PREVIEW;
  const visible = expanded || !showToggle ? features : features.slice(0, PREVIEW);
  return (
    <div className="mt-6">
      <ul className="space-y-2 text-sm text-cream/70 font-light">
        {visible.map((feat) => (
          <li key={feat} className="flex gap-2"><span className="text-gold">·</span>{feat}</li>
        ))}
      </ul>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-xs tracking-[0.28em] uppercase text-gold hover:text-gold/70 transition"
        >
          {expanded ? "− Weniger anzeigen" : `+ Mehr anzeigen (${features.length - PREVIEW})`}
        </button>
      )}
    </div>
  );
}

function VehicleDetailPage() {
  const { vehicleId } = Route.useParams();
  const { t } = useI18n();
  const { vehicle: v, loading, notFound } = useVehicle(vehicleId);
  const { settings } = useSettings();
  const cats = t.categories as Record<string, string>;
  const [imgIndex, setImgIndex] = useState(0);
  const [loadReservationForm, setLoadReservationForm] = useState(false);
  const reservationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loadReservationForm) return;
    const el = reservationRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadReservationForm(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadReservationForm]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-[70vh] flex items-center justify-center text-cream/50">…</div>
      </SiteLayout>
    );
  }
  if (notFound || !v) return <NotFound />;

  const specRows: { label: string; value: string }[] = [
    { label: t.vehicle.specs.engine, value: v.specs.engine },
    { label: t.vehicle.specs.power, value: v.specs.power },
  ];

  const imgCount = v.images.length;
  const goImg = (i: number) => imgCount > 0 && setImgIndex(((i % imgCount) + imgCount) % imgCount);
  const heroImage = v.images[0] ?? "";
  const heroNarrative = v.tagline || `${v.specs.engine} · ${v.specs.power} · ${v.year}`;
  const heroCategory = cats[v.category] ?? v.category;

  return (
    <SiteLayout>
      <section className="pt-28 md:pt-36 px-4 md:px-8 lg:px-12 pb-10">
        <div className="max-w-[1500px] mx-auto">

          {/* Top bar */}
          <div className="relative z-10 mb-6 flex items-center justify-between">
            <Link to="/fleet" className="relative z-10 inline-flex items-center gap-2 text-[0.7rem] tracking-[0.32em] uppercase text-cream/70 hover:text-gold transition">
              <ChevronLeft className="w-3.5 h-3.5" /> {t.nav.fleet}
            </Link>
          </div>

          {/* ===== HERO CARD — cinematic 16:9 top, details below ===== */}
          <div
            className="group relative isolate overflow-hidden animate-[heroFade_800ms_ease-out_both] border"
            style={{
              background: "linear-gradient(135deg, #050505 0%, #0A0A0A 40%, #111111 100%)",
              borderRadius: 20,
              borderColor: "rgba(212,175,55,0.18)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            }}
          >
            <style>{`@keyframes heroFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.10), transparent 40%)" }} />

            {/* Banner image — tight crop on the centre (logo area), much smaller */}
            <div className="relative w-full h-[180px] md:h-[240px] overflow-hidden">
              {v.hasImages ? (
                <>
                  <img
                    src={heroImage}
                    alt={v.name}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-[center_55%] transition-transform duration-[2200ms] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.50) 0%, rgba(5,5,5,0.10) 45%, rgba(5,5,5,0.70) 100%)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(5,5,5,0.55) 0%, transparent 50%, rgba(5,5,5,0.35) 100%)" }} />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-jet">
                  <span className="text-base uppercase font-light" style={{ color: "#D4AF37", letterSpacing: "0.22em" }}>Bilder folgen in Kürze</span>
                </div>
              )}

              <div className="absolute left-5 top-5">
                <div className="rounded-full border px-4 py-2 backdrop-blur-md" style={{ borderColor: "rgba(255,255,255,0.16)", background: "rgba(5,5,5,0.36)" }}>
                  <span className="text-[0.62rem] uppercase" style={{ color: "#F8F4EC", letterSpacing: "0.28em" }}>
                    {v.marque} Collection
                  </span>
                </div>
              </div>
            </div>

            {/* Details below image */}
            <div className="relative z-10 p-6 md:p-8 xl:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2" style={{ borderColor: "rgba(212,175,55,0.24)", background: "rgba(255,255,255,0.02)" }}>
                  <Shield className="h-3.5 w-3.5" style={{ color: "#D4AF37" }} />
                  <span className="text-[0.65rem] uppercase" style={{ color: "#E2C980", letterSpacing: "0.32em" }}>
                    {heroCategory}
                  </span>
                </div>
                <div className="inline-flex items-center rounded-full border px-4 py-2 text-[0.65rem] uppercase" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.62)", letterSpacing: "0.28em" }}>
                  {v.year}
                </div>
              </div>

              <div className="mt-5 text-[0.76rem] uppercase font-medium" style={{ color: "#D4AF37", letterSpacing: "0.36em" }}>
                {v.marque}
              </div>
              <h1 className="mt-3 font-display leading-[0.95]" style={{ color: "#F8F4EC", fontSize: "clamp(2.2rem,5vw,4rem)" }}>
                {v.name}
              </h1>
              <p className="mt-4 max-w-[44rem] text-sm md:text-base font-light italic leading-relaxed" style={{ color: "rgba(248,244,236,0.74)" }}>
                {heroNarrative}
              </p>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { icon: Cog, label: t.vehicle.specs.engine, value: v.specs.engine },
                  { icon: Gauge, label: t.vehicle.specs.power, value: v.specs.power },
                  { icon: CalendarDays, label: t.vehicle.specs.year, value: String(v.year) },
                  { icon: Palette, label: t.vehicle.specs.color, value: v.color || "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border p-3 md:p-4 min-w-0"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))" }}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "#D4AF37" }} />
                    <div className="mt-3 text-[0.6rem] uppercase" style={{ color: "rgba(248,244,236,0.46)", letterSpacing: "0.28em" }}>
                      {label}
                    </div>
                    <div className="mt-2 text-sm md:text-base font-medium leading-snug break-words" style={{ color: "#F8F4EC" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-5 border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="text-[0.62rem] uppercase mb-1" style={{ color: "rgba(248,244,236,0.42)", letterSpacing: "0.32em" }}>
                      {t.vehicle.reservationFrom}
                    </div>
                    <div className="price leading-none" style={{ fontSize: "clamp(2rem,3.5vw,3rem)" }}>
                      {settings.show_prices && v.pricePerDay > 0
                        ? `${formatPrice(v.pricePerDay)} ${t.common.perDay}`
                        : t.vehicle.priceOnRequest}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={async () => {
                        const url = window.location.href;
                        if (navigator.share) {
                          try {
                            await navigator.share({ title: document.title, url });
                          } catch { /* ignore */ }
                        } else {
                          try {
                            await navigator.clipboard.writeText(url);
                          } catch { /* ignore */ }
                        }
                      }}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 px-5 md:px-6 text-[0.72rem] uppercase font-medium transition-all border hover:border-gold/70 hover:text-gold"
                      style={{
                        color: "#F8F4EC",
                        letterSpacing: "0.28em",
                        borderRadius: 999,
                        borderColor: "rgba(255,255,255,0.18)",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      Teilen
                    </button>

                    <a
                      href="#reservation"
                      className="group/cta inline-flex min-h-[52px] items-center justify-center gap-3 px-7 md:px-9 text-[0.72rem] uppercase font-medium transition-all flex-1 sm:flex-none"
                      style={{
                        background: "linear-gradient(135deg, #D4AF37 0%, #E2C980 100%)",
                        color: "#090909",
                        letterSpacing: "0.28em",
                        borderRadius: 999,
                        boxShadow: "0 14px 40px rgba(212,175,55,0.22)",
                      }}
                    >
                      {t.vehicle.requestNow}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* ===== Feature pills ===== */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 p-5 rounded-2xl border border-border bg-jet/40">
            {[
              { icon: ShieldCheck, ...t.vehicle.featurePills[0] },
              { icon: CalendarDays, ...t.vehicle.featurePills[1] },
              { icon: MapPin, ...t.vehicle.featurePills[2] },
              { icon: Headphones, ...t.vehicle.featurePills[3] },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs tracking-[0.2em] uppercase text-cream font-medium leading-tight">{title}</div>
                  <div className="mt-1.5 text-xs text-cream/55 leading-relaxed font-light">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== Gallery slideshow with thumbnails ===== */}
          {v.hasImages && imgCount > 0 && (
            <div id="gallery" className="mt-6 space-y-4">
              <div className="relative mx-auto w-full max-w-4xl aspect-[16/9] overflow-hidden rounded-2xl bg-jet">
                <img
                  key={v.images[imgIndex] + imgIndex}
                  src={v.images[imgIndex]}
                  alt={`${v.name} — ${imgIndex + 1}`}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                />
                {imgCount > 1 && (
                  <>
                    <button type="button" aria-label="Vorheriges Bild" onClick={() => goImg(imgIndex - 1)} className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-md border border-gold/50 bg-onyx/55 backdrop-blur-sm text-cream hover:border-gold hover:text-gold transition">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button type="button" aria-label="Nächstes Bild" onClick={() => goImg(imgIndex + 1)} className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-md border border-gold/50 bg-onyx/55 backdrop-blur-sm text-cream hover:border-gold hover:text-gold transition">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute top-5 right-5 px-3 py-1.5 rounded-md border border-cream/15 bg-jet/60 text-[0.7rem] tracking-[0.22em] text-cream/85">
                      {imgIndex + 1} / {imgCount}
                    </div>
                  </>
                )}
              </div>
              {imgCount > 1 && (
                <>
                  <div className="hidden md:flex gap-2.5 overflow-x-auto pb-1 justify-center">
                  {v.images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => goImg(i)}
                      aria-label={`Bild ${i + 1}`}
                      className={`relative w-20 h-14 md:w-24 md:h-16 shrink-0 overflow-hidden rounded-md border-2 transition ${i === imgIndex ? "border-gold" : "border-cream/20 hover:border-cream/50"}`}
                    >
                      <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  </div>
                  <div className="flex md:hidden justify-center gap-2 pt-1">
                    {v.images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goImg(i)}
                        aria-label={`Bild ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === imgIndex ? "w-7 bg-gold" : "w-2 bg-cream/30"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Vehicle features list */}
          {v.features.length > 0 && (
            <div className="mt-6 p-5 md:p-6 rounded-2xl border border-border bg-jet/40">
              <div className="flex items-center gap-4 mb-5">
                <span className="eyebrow">{t.vehicle.specifications}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-cream/70 font-light">
                {v.features.map((feat) => (
                  <div key={feat} className="flex gap-2.5 leading-relaxed">
                    <span className="text-gold mt-1">·</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* ===== MIETKONDITIONEN ===== */}
          <div className="mt-6 p-5 md:p-6 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-5">
              <span className="eyebrow">{t.vehicle.conditionsTitle}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.freeKm}</div>
                <div className="mt-2 price text-xl md:text-2xl leading-tight">


                  {v.conditions.freeKm != null ? `${v.conditions.freeKm} km` : t.vehicle.onRequest}
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">{t.vehicle.freeKmHint}</div>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.extraKm}</div>
                <div className="mt-2 price text-xl md:text-2xl leading-tight">
                  {v.conditions.extraKmPrice != null ? `${formatEuro2(v.conditions.extraKmPrice)} / km` : t.vehicle.onRequest}
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">{t.vehicle.extraKmHint}</div>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.deposit}</div>
                <div className="mt-2 price text-xl md:text-2xl leading-tight">
                  {v.conditions.deposit != null ? formatPrice(v.conditions.deposit) : t.vehicle.onRequest}
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">{t.vehicle.depositHint}</div>
              </div>
            </div>
          </div>

          {/* ===== VORAUSSETZUNGEN ===== */}
          <div className="mt-6 p-5 md:p-6 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-5">
              <span className="eyebrow">{t.vehicle.requirementsTitle}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.minAge}</div>
                <div className="mt-2 price text-xl md:text-2xl leading-tight">


                  {v.conditions.minAge != null ? `${v.conditions.minAge} ${t.vehicle.ageUnit}` : t.vehicle.onRequest}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.license}</div>
                <div className="mt-2 price text-xl md:text-2xl leading-tight">
                  {v.conditions.minLicenseYears != null ? t.vehicle.licenseMin.replace("{n}", String(v.conditions.minLicenseYears)) : t.vehicle.onRequest}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div ref={reservationRef} id="reservation" className="scroll-mt-24">
        {loadReservationForm ? (
          <Suspense fallback={<div className="mt-10 py-16 text-center text-cream/50">…</div>}>
            <VehicleReservationForm vehicle={v} />
          </Suspense>
        ) : (
          <section className="mt-10 py-16 md:py-20 px-6 md:px-12 bg-jet/40 border-y border-border min-h-[320px]" />
        )}
      </div>
    </SiteLayout>
  );
}
