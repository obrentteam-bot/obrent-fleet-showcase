import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { vehicles, formatPrice } from "@/lib/vehicles";
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

export const Route = createFileRoute("/fleet/$vehicleId")({
  head: ({ params }) => {
    const v = vehicles.find((x) => x.id === params.vehicleId);
    const title = v ? `${v.name} — OBRENT` : "Fahrzeug — OBRENT";
    return {
      meta: [
        { title },
        { name: "description", content: v?.tagline ?? "Reservieren Sie ein Fahrzeug bei OBRENT." },
        { property: "og:title", content: title },
        { property: "og:description", content: v?.tagline ?? "Reservieren Sie ein Fahrzeug bei OBRENT." },
        ...(v ? [{ property: "og:image", content: v.image }] : []),
      ],
    };
  },
  loader: ({ params }) => {
    const vehicle = vehicles.find((v) => v.id === params.vehicleId);
    if (!vehicle) throw notFound();
    return { vehicle };
  },
  notFoundComponent: () => <NotFound />,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl text-cream mb-4">Etwas ist schiefgelaufen</h1>
        <p className="text-cream/60 mb-8">{error.message}</p>
        <Link to="/fleet" className="btn-ghost">Zurück zur Flotte</Link>
      </div>
    </SiteLayout>
  ),
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

function VehicleDetailPage() {
  const { vehicleId } = Route.useParams();
  const { t, lang } = useI18n();
  const v = vehicles.find((x) => x.id === vehicleId)!;
  const cf = t.contact.form;
  const f = t.vehicle.form;

  const [salutation, setSalutation] = useState<string>("");
  const [titleVal, setTitleVal] = useState<string>("none");
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [delivery, setDelivery] = useState<"pickup" | "custom">("pickup");
  const [chauffeur, setChauffeur] = useState<"yes" | "no">("no");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateLocale = lang === "de" ? de : undefined;

  const specRows: { label: string; value: string }[] = [
    { label: t.vehicle.specs.engine, value: v.specs.engine },
    { label: t.vehicle.specs.power, value: v.specs.power },
    { label: t.vehicle.specs.acceleration, value: v.specs.acceleration },
    { label: t.vehicle.specs.topSpeed, value: v.specs.topSpeed },
    { label: t.vehicle.specs.transmission, value: v.specs.transmission },
    { label: t.vehicle.specs.seats, value: v.specs.seats },
  ];

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
                <img src={v.image} alt={v.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-6 left-6 eyebrow text-cream/80 bg-onyx/50 backdrop-blur px-3 py-2">{t.categories[v.category]}</div>
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
                  </tbody>
                </table>
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!ageConfirmed) {
                setShowAgeError(true);
                return;
              }
              setShowAgeError(false);
            }}
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
              <input className="lux-input" type="text" placeholder={f.namePlaceholder} />
            </div>
            <div>
              <label className="lux-label">{f.email}</label>
              <input className="lux-input" type="email" placeholder={f.emailPlaceholder} />
            </div>
            <div>
              <label className="lux-label">{f.phone}</label>
              <input className="lux-input" type="tel" placeholder={f.phonePlaceholder} />
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
            </div>
            <div className="md:col-span-2">
              <label className="lux-label">{cf.chauffeur}</label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                  <input
                    type="radio"
                    name="chauffeur"
                    value="yes"
                    checked={chauffeur === "yes"}
                    onChange={() => setChauffeur("yes")}
                    className="accent-gold"
                  />
                  <span className="text-sm">{cf.chauffeurYes}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                  <input
                    type="radio"
                    name="chauffeur"
                    value="no"
                    checked={chauffeur === "no"}
                    onChange={() => setChauffeur("no")}
                    className="accent-gold"
                  />
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
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={delivery === "pickup"}
                    onChange={() => setDelivery("pickup")}
                    className="accent-gold"
                  />
                  <span className="text-sm">{cf.deliveryPickup}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                  <input
                    type="radio"
                    name="delivery"
                    value="custom"
                    checked={delivery === "custom"}
                    onChange={() => setDelivery("custom")}
                    className="accent-gold"
                  />
                  <span className="text-sm">{cf.deliveryCustom}</span>
                </label>
              </div>
              <p className="mt-2 text-xs text-cream/40">{cf.deliveryHint}</p>
              {delivery === "custom" && (
                <div className="mt-4">
                  <label className="lux-label">{cf.deliveryAddress}</label>
                  <input
                    className="lux-input"
                    type="text"
                    maxLength={200}
                    placeholder={cf.deliveryAddressPlaceholder}
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="lux-label">{f.message}</label>
              <textarea className="lux-input resize-none" rows={4} placeholder={f.messagePlaceholder} />
            </div>
            <div className="md:col-span-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => {
                    setAgeConfirmed(e.target.checked);
                    if (e.target.checked) setShowAgeError(false);
                  }}
                  className="mt-1 h-4 w-4 accent-gold flex-shrink-0"
                />
                <span className="text-sm text-cream/70 leading-relaxed group-hover:text-cream/90 transition-colors">
                  {cf.ageConfirm}
                </span>
              </label>
              {showAgeError && (
                <p className="mt-2 text-xs text-red-400/90">{cf.ageRequired}</p>
              )}
            </div>
            <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-4">
              <p className="text-xs text-cream/40 max-w-md">
                {f.disclaimer}
              </p>
              <button
                type="submit"
                disabled={!ageConfirmed}
                className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {f.submit}
              </button>
            </div>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
