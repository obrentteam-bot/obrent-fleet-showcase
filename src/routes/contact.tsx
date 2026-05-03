import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TimeSelect } from "@/components/TimeSelect";
import { ChauffeurDetails } from "@/components/ChauffeurDetails";
import { supabase } from "@/lib/supabase";

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

const offices = [
  { city: "Mannheim", line1: "Käferthaler Straße 40", line2: "68167 Mannheim", phone: "+49 15569 459633" },
];

function ContactPage() {
  const { t, lang } = useI18n();
  const f = t.contact.form;
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("18:00");
  const [delivery, setDelivery] = useState<"pickup" | "custom">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [chauffeur, setChauffeur] = useState<"yes" | "no">("no");
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateLocale = lang === "de" ? de : undefined;
  return (
    <SiteLayout>
      <section className="pt-40 pb-16 px-6 md:px-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">{t.contact.eyebrow}</span>
          </div>
          <h1 className="font-display text-5xl md:text-8xl text-cream leading-[0.95]">
            {t.contact.title} <span className="italic text-gold/90 font-light">{t.contact.titleItalic}</span>.
          </h1>
          <p className="mt-8 text-lg text-cream/60 font-light max-w-2xl leading-relaxed">
            {t.contact.lead}
          </p>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="py-16 border border-gold/30 bg-onyx/40 text-center">
                <div className="eyebrow text-gold mb-4">✓</div>
                <h3 className="font-display text-3xl text-cream mb-3">Vielen Dank!</h3>
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
                const today2 = new Date();
                const extra = [
                  subject && `Betreff: ${subject}`,
                  pickupTime && `Abholzeit: ${pickupTime}`,
                  returnTime && `Rückgabezeit: ${returnTime}`,
                  `Übergabe: ${delivery === "pickup" ? "Abholung Standort" : `Lieferung — ${deliveryAddress}`}`,
                  `Chauffeur: ${chauffeur === "yes" ? "Ja" : "Nein"}`,
                  messageText && `Nachricht: ${messageText}`,
                ].filter(Boolean).join("\n");
                const { error } = await supabase.from("bookings").insert({
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
                if (error) setSubmitError(error.message);
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
              <div>
                <label className="lux-label">{f.phone}</label>
                <input className="lux-input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+49 30 00 00 00" />
              </div>
              <div>
                <label className="lux-label">{f.phone}</label>
                <input className="lux-input" type="tel" placeholder="+49 30 00 00 00" />
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
              {chauffeur === "yes" && <ChauffeurDetails />}

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

          <aside className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-border space-y-12">
            <div>
              <div className="eyebrow mb-4">{t.contact.direct}</div>
              <div className="font-display text-2xl text-cream">concierge@obrent.com</div>
              <div className="mt-2 text-cream/55">+49 15569 459633</div>
            </div>
            <div className="space-y-8">
              <div className="eyebrow">{t.contact.ateliers}</div>
              {offices.map((o) => (
                <div key={o.city} className="border-l border-gold/30 pl-5">
                  <div className="font-display text-2xl text-cream mb-1">{o.city}</div>
                  <div className="text-sm text-cream/60 font-light">{o.line1}</div>
                  <div className="text-sm text-cream/60 font-light">{o.line2}</div>
                  <div className="text-sm text-gold/80 mt-2">{o.phone}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
