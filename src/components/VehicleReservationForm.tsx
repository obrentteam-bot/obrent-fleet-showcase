import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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
import { ChauffeurDetails, emptyChauffeurFields, type ChauffeurFieldsValue } from "@/components/ChauffeurDetails";
import { TimeSelect } from "@/components/TimeSelect";
import { FEATURES } from "@/lib/features";
import { useI18n } from "@/lib/i18n";
import { submitBooking } from "@/lib/submitBooking";
import { useSettings } from "@/lib/useSettings";
import { cn } from "@/lib/utils";
import type { UiVehicle } from "@/lib/supabase";

export function VehicleReservationForm({ vehicle }: { vehicle: UiVehicle }) {
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const cf = t.contact.form;
  const f = t.vehicle.form;

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
  const [chauffeurFields, setChauffeurFields] = useState<ChauffeurFieldsValue>(emptyChauffeurFields);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateLocale = lang === "de" ? de : undefined;

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

    const ccf = cf.chauffeurFields;
    const tripTypeLabels: Record<string, string> = {
      oneway: ccf.tripOneway, roundtrip: ccf.tripRound, hourly: ccf.tripHourly, fullday: ccf.tripFullday,
    };
    const occasionLabels: Record<string, string> = {
      business: ccf.occBusiness, airport: ccf.occAirport, wedding: ccf.occWedding, event: ccf.occEvent, other: ccf.occOther,
    };
    const langLabels: Record<string, string> = {
      any: ccf.langAny, de: ccf.langDe, en: ccf.langEn, tr: ccf.langTr,
    };
    const cd = chauffeurFields;
    const chauffeurLines = chauffeur === "yes" ? [
      cd.pickupAddress && `Abholadresse: ${cd.pickupAddress}`,
      cd.destination && `Zielort: ${cd.destination}`,
      cd.tripType && `Fahrttyp: ${tripTypeLabels[cd.tripType] ?? cd.tripType}`,
      cd.occasion && `Anlass: ${occasionLabels[cd.occasion] ?? cd.occasion}`,
      cd.passengers && `Passagiere: ${cd.passengers}`,
      cd.luggage && `Gepäck: ${cd.luggage}`,
      cd.language && `Sprache: ${langLabels[cd.language] ?? cd.language}`,
      cd.flight && `Flugnummer: ${cd.flight}`,
      cd.notes && `Hinweise Chauffeur: ${cd.notes.replace(/\n/g, " ")}`,
    ] : [];

    const extra = [
      `Abholzeit: ${pickupTime}`,
      `Rückgabezeit: ${returnTime}`,
      `Übergabe: ${delivery === "pickup" ? "Abholung Standort" : `Lieferung — ${deliveryAddress}`}`,
      `Chauffeur: ${chauffeur === "yes" ? "Ja" : "Nein"}`,
      ...chauffeurLines,
      message && `Nachricht: ${message.replace(/\n/g, " ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await submitBooking({
      vehicle_id: vehicle.id,
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
    <section id="reservation" className="mt-10 py-16 md:py-20 px-6 md:px-12 bg-jet/40 border-y border-border scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-5">
            <span className="gold-rule" />
            <span className="eyebrow">{t.vehicle.enquiryEyebrow}</span>
            <span className="gold-rule" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-cream">
            {t.vehicle.reserveTitle} <span className="italic text-gold/90 font-light">{vehicle.name}</span>
          </h2>
          <p className="mt-3 text-cream/55 font-light">{t.vehicle.reserveLead}</p>
        </div>

        {submitted ? (
          <div className="text-center py-12 border border-gold/30 bg-onyx/40">
            <div className="eyebrow text-gold mb-3">✓ {t.admin.status.confirmed}</div>
            <h3 className="font-display text-2xl text-cream mb-3">{t.vehicle.thankYouTitle}</h3>
            <p className="text-cream/60">{t.vehicle.thankYouLead}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
            {FEATURES.chauffeurService && (
              <>
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
                {chauffeur === "yes" && <ChauffeurDetails value={chauffeurFields} onChange={setChauffeurFields} />}
              </>
            )}

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
                {submitting ? "…" : (settings.cta_request_label || f.submit)}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}