import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice } from "@/lib/vehicles";
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
import { ImagePlaceholder } from "@/components/ImagePlaceholder";


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

  return (
    <SiteLayout>
      {/* Hero image */}
      <section className="pt-28 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <Link to="/fleet" className="text-xs tracking-[0.28em] uppercase text-cream/50 hover:text-gold transition">
            ← {t.nav.fleet}
          </Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7">
                <div className="relative aspect-[4/3] overflow-hidden bg-jet">
                  {v.hasImages ? (
                    <VehicleSlideshow images={v.images} alt={v.name} />
                  ) : (
                    <ImagePlaceholder className="w-full h-full" />
                  )}
                  <div className="absolute top-6 left-6 z-10 eyebrow text-cream/80 bg-onyx/50 backdrop-blur px-3 py-2">{cats[v.category] ?? v.category}</div>
                </div>
              </div>

            <div className="lg:col-span-5 lg:pl-8 lg:sticky lg:top-28">
              <div className="text-xs tracking-[0.28em] uppercase text-cream/45 mb-3">{v.marque}</div>
              <h1 className="font-display text-5xl md:text-6xl text-cream leading-[1]">{v.name}</h1>
              <p className="mt-6 text-lg text-cream/60 font-light italic leading-relaxed">{v.tagline}</p>

              <div className="mt-10 pt-8 border-t border-border">
                <div className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/40 mb-2">{t.vehicle.reservationFrom}</div>
                <div className="font-display text-5xl text-gold">{formatPrice(v.pricePerDay)}<span className="text-base text-cream/40 ml-2 font-sans">{t.common.perDay}</span></div>
                <div className="mt-3 text-xs text-cream/50">{t.vehicle.includes}</div>
              </div>

              <div className="mt-10">
                <div className="eyebrow mb-6">{t.vehicle.specifications}</div>
                <table className="w-full">
                  <tbody>
                    {specRows.map((r) => (
                      <tr key={r.label} className="border-b border-border/60">
                        <td className="py-4 text-xs tracking-[0.22em] uppercase text-cream/45">{r.label}</td>
                        <td className="py-4 text-right text-sm text-cream font-light">{r.value}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-border/60">
                      <td className="py-4 text-xs tracking-[0.22em] uppercase text-cream/45">Baujahr</td>
                      <td className="py-4 text-right text-sm text-cream font-light">{v.year}</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-4 text-xs tracking-[0.22em] uppercase text-cream/45">Farbe</td>
                      <td className="py-4 text-right text-sm text-cream font-light">{v.color}</td>
                    </tr>
                  </tbody>
                </table>
                {v.features.length > 0 && (
                  <FeatureList features={v.features} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation form */}
      <section className="mt-28 py-24 md:py-32 px-6 md:px-12 bg-jet/40 border-y border-border">
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
