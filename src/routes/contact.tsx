import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Mail, Phone, MapPin, Sparkles, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimeSelect } from "@/components/TimeSelect";
import { ChauffeurDetails, emptyChauffeurFields, type ChauffeurFieldsValue } from "@/components/ChauffeurDetails";
import { FEATURES } from "@/lib/features";
import { submitBooking } from "@/lib/submitBooking";
import { useSettings } from "@/lib/useSettings";
const contactHero = { url: "https://fiikwjyjgtdanoieanuc.supabase.co/storage/v1/object/public/page-images/contact-hero.jpg" };

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Concierge kontaktieren — OBRENT" },
      { name: "description", content: "Sprechen Sie mit einem OBRENT-Concierge, um ein privates Fahrerlebnis in Monaco, Paris oder Dubai zu gestalten." },
      { property: "og:title", content: "Concierge kontaktieren — OBRENT" },
      { property: "og:description", content: "Eine Einladung, ein Gespräch zu beginnen." },
    ],
  }),
  component: ContactPage,
});


function ContactPage() {
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const addressLines = settings.address.split(",").map((s) => s.trim());
  const f = t.contact.form;
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
  const [salutation, setSalutation] = useState<string>("");
  const [titleVal, setTitleVal] = useState<string>("none");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateLocale = lang === "de" ? de : undefined;
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative w-full overflow-hidden bg-onyx">
        <img
          src={contactHero.url}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/35 via-onyx/45 to-onyx/60 dark:from-onyx/70 dark:via-onyx/80 dark:to-onyx" />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx/30 via-transparent to-onyx/15 dark:from-onyx/80 dark:via-transparent dark:to-onyx/40" />
        <div className="relative pt-32 pb-12 px-6 md:px-12">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <span className="gold-rule" />
              <span className="eyebrow">{t.contact.eyebrow}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-cream leading-[0.95] tracking-tight">
              {t.contact.title} <span className="italic text-gold/90 font-light">{t.contact.titleItalic}</span>.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-cream/70 font-light max-w-2xl leading-relaxed">
              {t.contact.lead}
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-10 md:py-14 px-6 md:px-12 bg-onyx">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-cream/10 bg-gradient-to-br from-cream/[0.04] via-cream/[0.02] to-transparent backdrop-blur-sm p-6 sm:p-10 md:p-12 shadow-2xl shadow-black/40">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            {submitted ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full border border-gold/40 bg-gold/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-display text-3xl text-cream mb-3">Vielen Dank, {submittedName || ""}!</h3>
                <p className="text-cream/60">Ihre Nachricht wurde übermittelt. Wir melden uns in Kürze.</p>
              </div>
            ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!ageConfirmed) {
                  setShowAgeError(true);
                  return;
                }
                setShowAgeError(false);
                setSubmitting(true);
                setSubmitError(null);
                const fullName = [
                  salutation && f.salutationOptions[salutation as keyof typeof f.salutationOptions],
                  titleVal !== "none" && f.titleOptions[titleVal as keyof typeof f.titleOptions],
                  name,
                ].filter(Boolean).join(" ");
                setSubmittedName(fullName || name || "");
                const today2 = new Date();
                const tripTypeLabels: Record<string, string> = {
                  oneway: f.chauffeurFields.tripOneway,
                  roundtrip: f.chauffeurFields.tripRound,
                  hourly: f.chauffeurFields.tripHourly,
                  fullday: f.chauffeurFields.tripFullday,
                };
                const occasionLabels: Record<string, string> = {
                  business: f.chauffeurFields.occBusiness,
                  airport: f.chauffeurFields.occAirport,
                  wedding: f.chauffeurFields.occWedding,
                  event: f.chauffeurFields.occEvent,
                  other: f.chauffeurFields.occOther,
                };
                const langLabels: Record<string, string> = {
                  any: f.chauffeurFields.langAny,
                  de: f.chauffeurFields.langDe,
                  en: f.chauffeurFields.langEn,
                  tr: f.chauffeurFields.langTr,
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
                  subject && `Betreff: ${subject}`,
                  pickupTime && `Abholzeit: ${pickupTime}`,
                  returnTime && `Rückgabezeit: ${returnTime}`,
                  `Übergabe: ${delivery === "pickup" ? "Abholung Standort" : `Lieferung — ${deliveryAddress}`}`,
                  `Chauffeur: ${chauffeur === "yes" ? "Ja" : "Nein"}`,
                  ...chauffeurLines,
                  messageText && `Nachricht: ${messageText.replace(/\n/g, " ")}`,
                ].filter(Boolean).join("\n");
                const { error } = await submitBooking({
                  vehicle_id: null,
                  customer_name: fullName || name || "—",
                  email,
                  phone,
                  start_date: (pickupDate ?? today2).toISOString().slice(0, 10),
                  end_date: (returnDate ?? pickupDate ?? today2).toISOString().slice(0, 10),
                  message: extra,
                  status: "pending",
                });
                setSubmitting(false);
                if (error) setSubmitError(error);
                else setSubmitted(true);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
            >
              <div>
                <label className="lux-label">{f.salutation}</label>
                <Select value={salutation} onValueChange={setSalutation}>
                  <SelectTrigger className="lux-input h-auto">
                    <SelectValue placeholder={f.salutationPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">{f.salutationOptions.mr}</SelectItem>
                    <SelectItem value="ms">{f.salutationOptions.ms}</SelectItem>
                    <SelectItem value="divers">{f.salutationOptions.divers}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="lux-label">{f.title}</label>
                <Select value={titleVal} onValueChange={setTitleVal}>
                  <SelectTrigger className="lux-input h-auto">
                    <SelectValue placeholder={f.titlePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{f.titleOptions.none}</SelectItem>
                    <SelectItem value="dr">{f.titleOptions.dr}</SelectItem>
                    <SelectItem value="profDr">{f.titleOptions.profDr}</SelectItem>
                    <SelectItem value="prof">{f.titleOptions.prof}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.name}</label>
                <input className="lux-input" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jonathan Beaumont" />
              </div>
              <div>
                <label className="lux-label">{f.email}</label>
                <input className="lux-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jonathan@residenz.de" />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.phone}</label>
                <input className="lux-input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 30 00 00 00" />
              </div>
              <div>
                <label className="lux-label">{f.pickupDate}</label>
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
                      {pickupDate ? format(pickupDate, "PPP", { locale: dateLocale }) : <span>{f.pickDate}</span>}
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
                <TimeSelect value={pickupTime} onChange={setPickupTime} ariaLabel={f.time} />
              </div>
              <div>
                <label className="lux-label">{f.returnDate}</label>
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
                      {returnDate ? format(returnDate, "PPP", { locale: dateLocale }) : <span>{f.pickDate}</span>}
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
                <TimeSelect value={returnTime} onChange={setReturnTime} ariaLabel={f.time} />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.subject}</label>
                <input className="lux-input" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={f.subjectPlaceholder} />
              </div>
              {FEATURES.chauffeurService && (
                <>
                  <div className="md:col-span-2">
                    <label className="lux-label">{f.chauffeur}</label>
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
                        <span className="text-sm">{f.chauffeurYes}</span>
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
                        <span className="text-sm">{f.chauffeurNo}</span>
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-cream/40">{f.chauffeurHint}</p>
                  </div>
                  {chauffeur === "yes" && <ChauffeurDetails value={chauffeurFields} onChange={setChauffeurFields} />}
                </>
              )}

              <div className="md:col-span-2">
                <label className="lux-label">{f.delivery}</label>
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
                    <span className="text-sm">{f.deliveryPickup}</span>
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
                    <span className="text-sm">{f.deliveryCustom}</span>
                  </label>
                </div>
                <p className="mt-2 text-xs text-cream/40">{f.deliveryHint}</p>
                {delivery === "custom" && (
                  <div className="mt-4">
                    <label className="lux-label">{f.deliveryAddress}</label>
                    <input
                      className="lux-input"
                      type="text"
                      maxLength={200}
                      value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder={f.deliveryAddressPlaceholder}
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.message}</label>
                <textarea className="lux-input resize-none" rows={6} value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={f.messagePlaceholder} />
                <div className="flex justify-between mt-2 text-xs text-cream/50">
                  <span>{lang === "de" ? "Bitte schildern Sie Ihre Anfrage möglichst detailliert." : "Please describe your request in as much detail as possible."}</span>
                  <span>{messageText.length} / 150 {lang === "de" ? "Zeichen" : "characters"}</span>
                </div>
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
                    {f.ageConfirm}
                  </span>
                </label>
                {showAgeError && (
                  <p className="mt-2 text-xs text-red-400/90">{f.ageRequired}</p>
                )}
              </div>
              {submitError && (
                <div className="md:col-span-2 text-sm text-red-400/90">{submitError}</div>
              )}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={!ageConfirmed || submitting}
                  className="btn-gold w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "…" : f.submit}
                </button>
                <p className="mt-6 text-xs text-cream/40">
                  {f.confidential}
                </p>
              </div>
            </form>
            )}
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 via-gold/[0.03] to-transparent p-8">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="eyebrow text-gold">{t.contact.direct}</span>
              </div>
              <a href={`mailto:${settings.email}`} className="group flex items-center gap-4 py-4 border-b border-cream/10 hover:border-gold/40 transition-colors">
                <span className="w-10 h-10 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/40 transition-colors">
                  <Mail className="w-4 h-4 text-gold" />
                </span>
                <span className="font-display text-xl text-cream group-hover:text-gold transition-colors">{settings.email}</span>
              </a>
              <a href={`tel:${settings.phone}`} className="group flex items-center gap-4 pt-4 hover:text-gold transition-colors">
                <span className="w-10 h-10 rounded-full bg-cream/5 border border-cream/10 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/40 transition-colors">
                  <Phone className="w-4 h-4 text-gold" />
                </span>
                <span className="font-display text-xl text-cream group-hover:text-gold transition-colors">{settings.phone}</span>
              </a>
            </div>

            <div className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-8">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-gold" />
                <span className="eyebrow">{t.contact.ateliers}</span>
              </div>
              <div className="font-display text-2xl text-cream mb-3">{settings.company_name}</div>
              <div className="space-y-1">
                {addressLines.map((l, i) => (
                  <div key={i} className="text-sm text-cream/65 font-light">{l}</div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
