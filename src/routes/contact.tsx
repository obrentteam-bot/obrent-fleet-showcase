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
  { city: "Mannheim", line1: "Käferthaler Straße 40", line2: "68167 Mannheim", phone: "+49 621 000 000" },
];

function ContactPage() {
  const { t, lang } = useI18n();
  const f = t.contact.form;
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [delivery, setDelivery] = useState<"pickup" | "custom">("pickup");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [showAgeError, setShowAgeError] = useState(false);
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
                <label className="lux-label">{f.salutation}</label>
                <input className="lux-input" type="text" placeholder={f.salutationPlaceholder} />
              </div>
              <div>
                <label className="lux-label">{f.name}</label>
                <input className="lux-input" type="text" placeholder="Jonathan Beaumont" />
              </div>
              <div>
                <label className="lux-label">{f.email}</label>
                <input className="lux-input" type="email" placeholder="jonathan@residenz.de" />
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
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.subject}</label>
                <input className="lux-input" type="text" placeholder={f.subjectPlaceholder} />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.chauffeur}</label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                    <input type="radio" name="chauffeur" value="yes" className="accent-gold" />
                    <span className="text-sm">{f.chauffeurYes}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer text-cream/80">
                    <input type="radio" name="chauffeur" value="no" defaultChecked className="accent-gold" />
                    <span className="text-sm">{f.chauffeurNo}</span>
                  </label>
                </div>
                <p className="mt-2 text-xs text-cream/40">{f.chauffeurHint}</p>
              </div>
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
                      placeholder={f.deliveryAddressPlaceholder}
                    />
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{f.message}</label>
                <textarea className="lux-input resize-none" rows={6} placeholder={f.messagePlaceholder} />
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
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={!ageConfirmed}
                  className="btn-gold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {f.submit}
                </button>
                <p className="mt-6 text-xs text-cream/40">
                  {f.confidential}
                </p>
              </div>
            </form>
          </div>

          <aside className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-border space-y-12">
            <div>
              <div className="eyebrow mb-4">{t.contact.direct}</div>
              <div className="font-display text-2xl text-cream">concierge@obrent.com</div>
              <div className="mt-2 text-cream/55">+377 9777 0000</div>
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
