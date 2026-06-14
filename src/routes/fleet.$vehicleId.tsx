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
import { VehicleSlideshow } from "@/components/VehicleSlideshow";
import { toast } from "sonner";


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

  return (
    <SiteLayout>
      <section className="pt-32 px-4 md:px-8 lg:px-12 pb-16">
        <div className="max-w-[1500px] mx-auto">

          {/* Top bar: back link (left) + counter (right) — outside image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-6">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Link to="/fleet" className="text-[0.7rem] tracking-[0.32em] uppercase text-cream/70 hover:text-gold transition flex items-center gap-2">
                <ChevronLeft className="w-3.5 h-3.5" /> {t.nav.fleet}
              </Link>
              <div className="inline-flex items-center gap-2.5 self-start px-3.5 py-2 rounded-md border border-gold/50 bg-jet/40 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-gold" />
                <span className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/90">{cats[v.category] ?? v.category}</span>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-end">
              {imgCount > 1 && (
                <div className="px-4 py-1.5 rounded-md border border-cream/15 bg-jet/40 text-[0.72rem] tracking-[0.2em] text-cream/80">
                  {imgIndex + 1} / {imgCount}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* LEFT — gallery */}
            <div className="lg:col-span-7 space-y-5">
              <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-jet">
                {v.hasImages ? (
                  v.images.map((src, i) => (
                    <img
                      key={src + i}
                      src={src}
                      alt={`${v.name} — ${i + 1}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={i === 0 ? "high" : "low"}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === imgIndex ? "opacity-100" : "opacity-0"}`}
                    />
                  ))
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#B8975A] text-base tracking-[0.2em] uppercase font-light">Bilder folgen in Kürze</span>
                  </div>
                )}


                {/* Arrows */}
                {imgCount > 1 && (
                  <>
                    <button type="button" aria-label="Vorheriges Bild" onClick={() => goImg(imgIndex - 1)} className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-md border border-gold/50 bg-onyx/55 backdrop-blur-sm text-cream hover:border-gold hover:text-gold transition">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button type="button" aria-label="Nächstes Bild" onClick={() => goImg(imgIndex + 1)} className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-md border border-gold/50 bg-onyx/55 backdrop-blur-sm text-cream hover:border-gold hover:text-gold transition">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Thumbnails */}
                {imgCount > 1 && (
                  <div className="absolute bottom-5 left-5 z-10 flex gap-2.5">
                    {v.images.slice(0, 5).map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        onClick={() => goImg(i)}
                        aria-label={`Bild ${i + 1}`}
                        className={`relative w-16 h-12 md:w-20 md:h-14 overflow-hidden rounded-md border-2 transition ${i === imgIndex ? "border-gold" : "border-cream/20 hover:border-cream/50"}`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Feature pills — icon LEFT, text right */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 p-5 rounded-2xl border border-border bg-jet/40">
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
            </div>

            {/* RIGHT — details */}
            <div className="lg:col-span-5 space-y-7">
              <div>
                <div className="text-xs tracking-[0.32em] uppercase text-gold mb-3">{v.marque}</div>
                <h1 className="font-display text-5xl md:text-6xl text-cream leading-[1.02]">{v.name}</h1>
                {v.tagline && (
                  <p className="mt-5 text-base md:text-lg text-cream/55 font-light italic leading-relaxed">{v.tagline}</p>
                )}
              </div>

              {/* Price card */}
              <div className="p-6 md:p-7 rounded-2xl border border-border bg-jet/50">
                <div className="text-[0.65rem] tracking-[0.32em] uppercase text-cream/45 mb-3">{t.vehicle.reservationFrom}</div>
                <div className="font-display text-4xl md:text-5xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {t.vehicle.priceOnRequest}
                </div>
                <p className="mt-4 text-xs text-cream/50 font-light leading-relaxed">{t.vehicle.includes}</p>
              </div>

              {/* Specs moved below — see full-width section */}


              {/* Features bullets — show only top 4 like reference */}
              {v.features.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-cream/70 font-light">
                  {v.features.slice(0, 4).map((feat) => (
                    <div key={feat} className="flex gap-2.5 leading-relaxed">
                      <span className="text-gold mt-1">·</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}



              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href="#reservation"
                  className="group flex-[1.4] inline-flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-gradient-to-r from-gold to-gold-soft text-onyx font-medium text-[0.8rem] tracking-[0.2em] uppercase whitespace-nowrap hover:opacity-90 transition"
                >
                  <span>{t.vehicle.requestNow}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={async () => {
                    const shareData = {
                      title: `${v!.name} — OBRENT Luxus Autovermietung`,
                      text: "Schau dir dieses Fahrzeug bei OBRENT an — Luxus Autovermietung Ludwigshafen am Rhein.",
                      url: window.location.href,
                    };
                    if (navigator.share) {
                      try { await navigator.share(shareData); } catch {}
                    } else {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success("Link kopiert!", {
                          style: { background: "#0A0A0A", color: "#B8975A", border: "none" },
                        });
                      } catch {}
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-lg border border-cream/15 bg-jet/60 text-cream/80 text-[0.78rem] tracking-[0.22em] uppercase hover:border-gold hover:text-gold transition"
                >
                  <Share2 className="w-4 h-4" />
                  Teilen
                </button>
              </div>
            </div>
          </div>

          {/* Specs — separate full-width box with breathing room */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-6">
              <span className="eyebrow">{t.vehicle.specifications}</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: Cog, label: t.vehicle.specs.engine, value: v.specs.engine },
                { icon: Gauge, label: t.vehicle.specs.power, value: v.specs.power },
                { icon: CalendarDays, label: "Baujahr", value: String(v.year) },
                { icon: Palette, label: "Farbe", value: v.color },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-4 rounded-xl border border-border/70 bg-onyx/30">
                  <Icon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{label}</div>
                    <div className="mt-1.5 text-base text-cream font-light leading-snug break-words">{value || "—"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== MIETPREISSTAFFELUNG ===== */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-6">
              <span className="eyebrow">Mietpreisstaffelung</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "3 Stunden", value: v.pricing.h3 },
                { label: "6 Stunden", value: v.pricing.h6 },
                { label: "12 Stunden", value: v.pricing.h12 },
                { label: "24 Stunden", value: v.pricing.h24 },
              ].map(({ label, value }) => (
                <div key={label} className="p-5 rounded-xl border border-border/70 bg-onyx/30 text-center">
                  <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">{label}</div>
                  <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                    {SHOW_PRICES && value != null ? formatPrice(value) : "Preis auf Anfrage"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== MIETKONDITIONEN ===== */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-6">
              <span className="eyebrow">Mietkonditionen</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">Freikilometer</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.freeKm ?? 150} km
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">pro Tag inklusive</div>
              </div>
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">Zusatzkilometer</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.extraKmPrice != null ? `${formatEuro2(v.conditions.extraKmPrice)} / km` : "auf Anfrage"}
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">über Freikilometer hinaus</div>
              </div>
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">Kaution</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.deposit != null ? formatPrice(v.conditions.deposit) : "auf Anfrage"}
                </div>
                <div className="mt-1 text-xs text-cream/50 font-light">vollständig erstattbar</div>
              </div>
            </div>
          </div>

          {/* ===== VORAUSSETZUNGEN ===== */}
          <div className="mt-10 p-6 md:p-8 rounded-2xl border border-border bg-jet/40">
            <div className="flex items-center gap-4 mb-6">
              <span className="eyebrow">Voraussetzungen</span>
              <span className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">Mindestalter</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.minAge != null ? `${v.conditions.minAge} Jahre` : "auf Anfrage"}
                </div>
              </div>
              <div className="p-5 rounded-xl border border-border/70 bg-onyx/30">
                <div className="text-[0.62rem] tracking-[0.22em] uppercase text-cream/50 leading-tight">Führerschein</div>
                <div className="mt-3 font-display text-2xl md:text-3xl italic leading-tight" style={{ color: "#B8975A" }}>
                  {v.conditions.minLicenseYears != null ? `Mindestens ${v.conditions.minLicenseYears} Jahre` : "auf Anfrage"}
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
              <h3 className="font-display text-3xl text-cream mb-4">Vielen Dank!</h3>
              <p className="text-cream/60">Ihre Anfrage wurde übermittelt. Wir melden uns in Kürze.</p>
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
