import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, Shield, CalendarDays, MapPin, Headphones, Cog, Gauge, Palette, ShieldCheck, ArrowRight, Share2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice, formatEuro2, SHOW_PRICES } from "@/lib/vehicles";
import { useVehicle } from "@/lib/useVehicles";
import { submitBooking } from "@/lib/submitBooking";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TimeSelect } from "@/components/TimeSelect";
import { ChauffeurDetails } from "@/components/ChauffeurDetails";


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
  const { t, lang } = useI18n();
  const { vehicle: v, loading, notFound } = useVehicle(vehicleId);
  const cf = t.contact.form;
  const f = t.vehicle.form;
  const cats = t.categories as Record<string, string>;

  const [salutation, setSalutation] = useState<string>("");
  const [titleVal, setTitleVal] = useState<string>("none");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("18:00");
  const [delivery, setDelivery] = useState<"pickup" | "custom">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [chauffeur, setChauffeur] = useState<"yes" | "no">("no");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateLocale = lang === "de" ? de : undefined;

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ageConfirmed) {
      setShowAgeError(true);
      return;
    }
    if (!pickupDate || !returnDate) return;
    setSubmitting(true);
    setSubmitError(null);

    const fullName = [
      salutation && cf.salutationOptions[salutation as keyof typeof cf.salutationOptions],
      titleVal !== "none" && cf.titleOptions[titleVal as keyof typeof cf.titleOptions],
      name,
    ]
      .filter(Boolean)
      .join(" ");

    const extra = [
      `Abholzeit: ${pickupTime}`,
      `Rückgabezeit: ${returnTime}`,
      `Übergabe: ${delivery === "pickup" ? "Abholung Standort" : `Lieferung — ${deliveryAddress}`}`,
      `Chauffeur: ${chauffeur === "yes" ? "Ja" : "Nein"}`,
      message && `Nachricht: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await submitBooking({
      vehicle_id: v!.id,
      customer_name: fullName || name,
      email,
      phone,
      start_date: pickupDate.toISOString().slice(0, 10),
      end_date: returnDate.toISOString().slice(0, 10),
      message: extra,
      status: "pending",
    });

    setSubmitting(false);
    if (error) setSubmitError(error);
    else setSubmitted(true);
  }

  const imgCount = v.images.length;
  const goImg = (i: number) => imgCount > 0 && setImgIndex(((i % imgCount) + imgCount) % imgCount);
  const heroImage = v.images[0] ?? "";
  const heroNarrative = v.tagline || `${v.specs.engine} · ${v.specs.power} · ${v.year}`;
  const heroCategory = cats[v.category] ?? v.category;

  return (
    <SiteLayout>
      <section className="pt-32 px-4 md:px-8 lg:px-12 pb-16">
        <div className="max-w-[1500px] mx-auto">

          {/* Top bar */}
          <div className="mb-6 flex items-center justify-between">
            <Link to="/fleet" className="text-[0.7rem] tracking-[0.32em] uppercase text-cream/70 hover:text-gold transition flex items-center gap-2">
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
            <div className="relative w-full h-[220px] md:h-[300px] overflow-hidden">
              {v.hasImages ? (
                <>
                  <img
                    src={heroImage}
                    alt={v.name}
                    className="absolute inset-0 w-full h-full object-cover object-[center_20%] transition-transform duration-[2200ms] ease-out group-hover:scale-[1.04]"
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
            <div className="relative z-10 p-7 md:p-10 xl:p-14">
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

              <div className="mt-8 text-[0.76rem] uppercase font-medium" style={{ color: "#D4AF37", letterSpacing: "0.36em" }}>
                {v.marque}
              </div>
              <h1 className="mt-4 font-display leading-[0.95]" style={{ color: "#F8F4EC", fontSize: "clamp(2.6rem,6vw,4.8rem)" }}>
                {v.name}
              </h1>
              <p className="mt-5 max-w-[44rem] text-base md:text-lg font-light italic leading-relaxed" style={{ color: "rgba(248,244,236,0.74)" }}>
                {heroNarrative}
              </p>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { icon: Cog, label: t.vehicle.specs.engine, value: v.specs.engine },
                  { icon: Gauge, label: t.vehicle.specs.power, value: v.specs.power },
                  { icon: CalendarDays, label: t.vehicle.specs.year, value: String(v.year) },
                  { icon: Palette, label: t.vehicle.specs.color, value: v.color || "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border p-4 md:p-5 min-w-0"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))" }}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "#D4AF37" }} />
                    <div className="mt-4 text-[0.6rem] uppercase" style={{ color: "rgba(248,244,236,0.46)", letterSpacing: "0.28em" }}>
                      {label}
                    </div>
                    <div className="mt-2 text-sm md:text-base font-medium leading-snug break-words" style={{ color: "#F8F4EC" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-6 border-t pt-8" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div>
                    <div className="text-[0.62rem] uppercase mb-2" style={{ color: "rgba(248,244,236,0.42)", letterSpacing: "0.32em" }}>
                      {t.vehicle.reservationFrom}
                    </div>
                    <div className="font-display italic leading-none" style={{ color: "#D4AF37", fontSize: "clamp(2rem,3.6vw,3rem)" }}>
                      {t.vehicle.priceOnRequest}
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
                      className="inline-flex min-h-[60px] items-center justify-center gap-2 px-5 md:px-6 text-[0.72rem] uppercase font-medium transition-all border hover:border-gold/70 hover:text-gold"
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
                      className="group/cta inline-flex min-h-[60px] items-center justify-center gap-3 px-7 md:px-9 text-[0.72rem] uppercase font-medium transition-all flex-1 sm:flex-none"
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
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 p-5 rounded-2xl border border-border bg-jet/40">
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
            <div id="gallery" className="mt-10 space-y-4">
              <div className="relative mx-auto w-full max-w-4xl aspect-[16/9] overflow-hidden rounded-2xl bg-jet">
                {v.images.map((src, i) => (
                  <img
                    key={src + i}
                    src={src}
                    alt={`${v.name} — ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === imgIndex ? "opacity-100" : "opacity-0"}`}
                  />
                ))}
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
              <div className="flex gap-2.5 overflow-x-auto pb-1 justify-center">
                  {v.images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => goImg(i)}
                      aria-label={`Bild ${i + 1}`}
                      className={`relative w-20 h-14 md:w-24 md:h-16 shrink-0 overflow-hidden rounded-md border-2 transition ${i === imgIndex ? "border-gold" : "border-cream/20 hover:border-cream/50"}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vehicle features list */}
          {v.features.length > 0 && (
            <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
              <div className="flex items-center gap-4 mb-6">
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


          {/* ===== MIETPREISSTAFFELUNG ===== */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-6">
              <span className="eyebrow">{t.vehicle.pricingTitle}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t.vehicle.pricing.h3, value: v.pricing.h3 },
                { label: t.vehicle.pricing.h6, value: v.pricing.h6 },
                { label: t.vehicle.pricing.h12, value: v.pricing.h12 },
                { label: t.vehicle.pricing.h24, value: v.pricing.h24 },
              ].map(({ label, value }) => (
                <div key={label} className="p-5 rounded-xl border border-border/70 bg-onyx/30 text-center">
                  <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{label}</div>
                  <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                    {SHOW_PRICES && value != null ? formatPrice(value) : t.vehicle.priceOnRequest}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== MIETKONDITIONEN ===== */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-6">
              <span className="eyebrow">{t.vehicle.conditionsTitle}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.freeKm}</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.freeKm ?? 150} km
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">{t.vehicle.freeKmHint}</div>
              </div>
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.extraKm}</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.extraKmPrice != null ? `${formatEuro2(v.conditions.extraKmPrice)} / km` : t.vehicle.onRequest}
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">{t.vehicle.extraKmHint}</div>
              </div>
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.deposit}</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.deposit != null ? formatPrice(v.conditions.deposit) : t.vehicle.onRequest}
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">{t.vehicle.depositHint}</div>
              </div>
            </div>
          </div>

          {/* ===== VORAUSSETZUNGEN ===== */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-6">
              <span className="eyebrow">{t.vehicle.requirementsTitle}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.minAge}</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.minAge != null ? `${v.conditions.minAge} ${t.vehicle.ageUnit}` : t.vehicle.onRequest}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{t.vehicle.license}</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.minLicenseYears != null ? t.vehicle.licenseMin.replace("{n}", String(v.conditions.minLicenseYears)) : t.vehicle.onRequest}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Reservation form */}
      <section id="reservation" className="mt-12 py-24 md:py-32 px-6 md:px-12 bg-jet/40 border-y border-border scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="gold-rule" />
              <span className="eyebrow">{t.vehicle.enquiryEyebrow}</span>
              <span className="gold-rule" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-cream">
              {t.vehicle.reserveTitle} <span className="italic text-gold/90 font-light">{v.name}</span>
            </h2>
            <p className="mt-4 text-cream/55 font-light">{t.vehicle.reserveLead}</p>
          </div>

          {submitted ? (
            <div className="text-center py-16 border border-gold/30 bg-onyx/40">
              <div className="eyebrow text-gold mb-4">✓ {t.admin.status.confirmed}</div>
              <h3 className="font-display text-3xl text-cream mb-4">{t.vehicle.thankYouTitle}</h3>
              <p className="text-cream/60">{t.vehicle.thankYouLead}</p>
            </div>
          ) : (
          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
          >
            <div>
              <label className="lux-label">{cf.salutation}</label>
              <Select value={salutation} onValueChange={setSalutation}>
                <SelectTrigger className="lux-input h-auto">
                  <SelectValue placeholder={cf.salutationPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">{cf.salutationOptions.mr}</SelectItem>
                  <SelectItem value="ms">{cf.salutationOptions.ms}</SelectItem>
                  <SelectItem value="divers">{cf.salutationOptions.divers}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="lux-label">{cf.title}</label>
              <Select value={titleVal} onValueChange={setTitleVal}>
                <SelectTrigger className="lux-input h-auto">
                  <SelectValue placeholder={cf.titlePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{cf.titleOptions.none}</SelectItem>
                  <SelectItem value="dr">{cf.titleOptions.dr}</SelectItem>
                  <SelectItem value="profDr">{cf.titleOptions.profDr}</SelectItem>
                  <SelectItem value="prof">{cf.titleOptions.prof}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="lux-label">{f.name}</label>
              <input className="lux-input" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePlaceholder} />
            </div>
            <div>
              <label className="lux-label">{f.email}</label>
              <input className="lux-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={f.emailPlaceholder} />
            </div>
            <div>
              <label className="lux-label">{f.phone}</label>
              <input className="lux-input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={f.phonePlaceholder} />
            </div>
            <div>
              <label className="lux-label">{cf.pickupDate}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent border-cream/20 text-cream hover:bg-cream/5 hover:text-cream",
                      !pickupDate && "text-cream/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {pickupDate ? format(pickupDate, "PPP", { locale: dateLocale }) : <span>{cf.pickDate}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={(d) => {
                      setPickupDate(d);
                      if (d && returnDate && returnDate < d) setReturnDate(undefined);
                    }}
                    disabled={(date) => date < today}
                    initialFocus
                    locale={dateLocale}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <TimeSelect value={pickupTime} onChange={setPickupTime} ariaLabel={cf.time} />
            </div>
            <div>
              <label className="lux-label">{cf.returnDate}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-transparent border-cream/20 text-cream hover:bg-cream/5 hover:text-cream",
                      !returnDate && "text-cream/50"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                    {returnDate ? format(returnDate, "PPP", { locale: dateLocale }) : <span>{cf.pickDate}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < (pickupDate ?? today)}
                    initialFocus
                    locale={dateLocale}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <TimeSelect value={returnTime} onChange={setReturnTime} ariaLabel={cf.time} />
            </div>
            <div className="md:col-span-2">
              <label className="lux-label">{cf.chauffeur}</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                  <input type="radio" name="chauffeur" value="yes" checked={chauffeur === "yes"} onChange={() => setChauffeur("yes")} className="accent-gold" />
                  <span className="text-sm">{cf.chauffeurYes}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                  <input type="radio" name="chauffeur" value="no" checked={chauffeur === "no"} onChange={() => setChauffeur("no")} className="accent-gold" />
                  <span className="text-sm">{cf.chauffeurNo}</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-cream/40">{cf.chauffeurHint}</p>
            </div>
            {chauffeur === "yes" && <ChauffeurDetails />}

            <div className="md:col-span-2">
              <label className="lux-label">{cf.delivery}</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                  <input type="radio" name="delivery" value="pickup" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} className="accent-gold" />
                  <span className="text-sm">{cf.deliveryPickup}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                  <input type="radio" name="delivery" value="custom" checked={delivery === "custom"} onChange={() => setDelivery("custom")} className="accent-gold" />
                  <span className="text-sm">{cf.deliveryCustom}</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-cream/40">{cf.deliveryHint}</p>
              {delivery === "custom" && (
                <div className="mt-4">
                  <label className="lux-label">{cf.deliveryAddress}</label>
                  <input className="lux-input" type="text" maxLength={200} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder={cf.deliveryAddressPlaceholder} />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="lux-label">{f.message}</label>
              <textarea className="lux-input resize-none" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={f.messagePlaceholder} />
            </div>
            <div className="md:col-span-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={ageConfirmed} onChange={(e) => { setAgeConfirmed(e.target.checked); if (e.target.checked) setShowAgeError(false); }} className="mt-1 h-4 w-4 accent-gold flex-shrink-0" />
                <span className="text-sm text-cream/70 leading-relaxed group-hover:text-cream/90 transition-colors">{cf.ageConfirm}</span>
              </label>
              {showAgeError && (<p className="mt-2 text-xs text-red-400/90">{cf.ageRequired}</p>)}
            </div>
            {submitError && <div className="md:col-span-2 text-sm text-red-400/90">{submitError}</div>}
            <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-4">
              <p className="text-xs text-cream/40 max-w-md">{f.disclaimer}</p>
              <button type="submit" disabled={!ageConfirmed || submitting} className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? "…" : f.submit}
              </button>
            </div>
          </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
