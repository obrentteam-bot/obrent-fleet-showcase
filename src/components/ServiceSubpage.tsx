import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitBooking } from "@/lib/submitBooking";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeSelect } from "@/components/TimeSelect";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Bilingual = { de: string; en: string };

type SelectFieldDef = {
  type: "select";
  key: string;
  label: Bilingual;
  placeholder: Bilingual;
  required?: boolean;
  colSpan?: 1 | 2;
  options: { value: string; label: Bilingual }[];
};

type InputFieldDef = {
  type: "text" | "tel" | "email" | "number" | "date" | "time" | "datetime-local" | "textarea";
  key: string;
  label: Bilingual;
  required?: boolean;
  colSpan?: 1 | 2;
  placeholder?: Bilingual;
};

export type FieldDef = SelectFieldDef | InputFieldDef;

export type ServiceCardDef = {
  Icon: LucideIcon;
  label: Bilingual;
};

export type WhyCardDef = {
  Icon: LucideIcon;
  title: Bilingual;
  body: Bilingual;
};

export type ServiceSubpageProps = {
  serviceTitleEn: string; // e.g. "VIP Shuttle" — stored in Supabase booking message
  bgImage: string;
  hero: {
    eyebrow: Bilingual;
    headline: Bilingual;
    subline: Bilingual;
    cta: Bilingual;
  };
  leistungen: {
    title: Bilingual;
    cards: ServiceCardDef[];
  };
  why: {
    title: Bilingual;
    cards: WhyCardDef[];
  };
  form: {
    title: Bilingual;
    submit: Bilingual;
    fields: FieldDef[];
  };
};

const PAGE_LABELS = {
  de: {
    services: "Services",
    back: "Zurück zu Services",
    success: "Vielen Dank — wir melden uns kurzfristig persönlich.",
    sending: "Senden…",
  },
  en: {
    services: "Services",
    back: "Back to Services",
    success: "Thank you — we will personally get back to you shortly.",
    sending: "Sending…",
  },
};

export function ServiceSubpage(props: ServiceSubpageProps) {
  const { lang } = useI18n();
  const labels = PAGE_LABELS[lang];

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setVal = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));
  const dateLocale = lang === "de" ? de : enUS;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const scrollToForm = () => {
    const el = document.getElementById("anfrage");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const today = new Date().toISOString().slice(0, 10);
    const lines = props.form.fields
      .map((f) => {
        const v = values[f.key];
        if (!v) return null;
        const lbl = f.label[lang];
        if (f.type === "select") {
          const opt = f.options.find((o) => o.value === v);
          return `${lbl}: ${opt ? opt.label[lang] : v}`;
        }
        return `${lbl}: ${v}`;
      })
      .filter(Boolean)
      .join("\n");
    const body = `Service: ${props.serviceTitleEn}\n${lines}`;
    const { error: insErr } = await submitBooking({
      vehicle_id: null,
      customer_name:
        values["name"] || values["contact"] || values["company"] || "—",
      email: values["email"] || "",
      phone: values["phone"] || "",
      start_date: today,
      end_date: today,
      message: body,
      status: "pending",
    });
    setSubmitting(false);
    if (insErr) setError(insErr);
    else setSubmitted(true);
  };

  return (
    <>
      {/* HERO — full screen */}
      <section className="relative min-h-screen flex flex-col justify-end pt-32 pb-16 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={props.bgImage}
            alt=""
            className="w-full h-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-onyx/85 via-onyx/60 to-onyx" />
        </div>

        {/* spacer above hero */}

        <div className="relative max-w-[1280px] mx-auto w-full">
          <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold mb-8">
            {props.hero.eyebrow[lang]}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] max-w-4xl">
            {props.hero.headline[lang]}
          </h1>
          <p className="mt-8 text-base md:text-lg text-cream/70 font-light max-w-2xl leading-relaxed">
            {props.hero.subline[lang]}
          </p>
          <div className="mt-12 flex items-center gap-6">
            <button onClick={scrollToForm} className="btn-gold">
              {props.hero.cta[lang]}
            </button>
            <ArrowDown className="w-4 h-4 text-gold/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* LEISTUNGEN */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
            <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
              {props.leistungen.title[lang]}
            </h2>
            <span className="h-px w-24 bg-gold/60" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {props.leistungen.cards.map(({ Icon, label }) => (
              <article
                key={label.en}
                className="group border border-border/60 bg-card p-5 sm:p-8 lg:p-10 transition-all duration-500 hover:border-gold/60 hover:translate-y-[-2px]"
              >
                <Icon
                  className="w-7 h-7 sm:w-8 sm:h-8 text-gold mb-5 sm:mb-8 transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1.25}
                />
                <h3 className="font-display text-base sm:text-xl md:text-2xl text-foreground leading-tight">
                  {label[lang]}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY OBRENT */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-muted/40 border-y border-border/40">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold/80 mb-6">
              {lang === "de" ? "Warum OBRENT" : "Why OBRENT"}
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-foreground leading-tight max-w-3xl mx-auto">
              {props.why.title[lang]}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {props.why.cards.map(({ Icon, title, body }) => (
              <article
                key={title.en}
                className="border border-border/60 bg-card p-10 transition-all duration-500 hover:border-gold/60"
              >
                <Icon className="w-8 h-8 text-gold mb-6" strokeWidth={1.25} />
                <h3 className="font-display text-2xl text-foreground leading-tight mb-3">
                  {title[lang]}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">
                  {body[lang]}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="anfrage" className="py-24 md:py-32 px-6 md:px-12 scroll-mt-32">
        <div className="max-w-[900px] mx-auto">
          <div className="flex justify-center mb-16">
            <span className="h-px w-32 bg-gold/60" />
          </div>
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-6xl text-foreground leading-[0.95]">
              {props.form.title[lang]}
            </h2>
          </div>

          {submitted ? (
            <div className="py-16 border border-gold/30 bg-muted/40 text-center">
              <div className="text-[0.7rem] tracking-[0.28em] uppercase text-gold mb-4">
                ✓
              </div>
              <p className="text-foreground/80">{labels.success}</p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
            >
              {props.form.fields.map((f) => {
                const span = f.colSpan === 2 ? "md:col-span-2" : "";
                if (f.type === "select") {
                  return (
                    <div key={f.key} className={span}>
                      <label className="lux-label">{f.label[lang]}</label>
                      <Select
                        value={values[f.key] || ""}
                        onValueChange={(v) => setVal(f.key, v)}
                      >
                        <SelectTrigger className="lux-input h-auto">
                          <SelectValue placeholder={f.placeholder[lang]} />
                        </SelectTrigger>
                        <SelectContent>
                          {f.options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label[lang]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }
                if (f.type === "textarea") {
                  return (
                    <div key={f.key} className={span || "md:col-span-2"}>
                      <label className="lux-label">{f.label[lang]}</label>
                      <textarea
                        className="lux-input resize-none"
                        rows={6}
                        value={values[f.key] || ""}
                        onChange={(e) => setVal(f.key, e.target.value)}
                      />
                    </div>
                  );
                }
                return (
                  <div key={f.key} className={span}>
                    <label className="lux-label">{f.label[lang]}</label>
                    <input
                      className="lux-input"
                      type={f.type}
                      required={f.required}
                      value={values[f.key] || ""}
                      onChange={(e) => setVal(f.key, e.target.value)}
                      placeholder={f.placeholder?.[lang]}
                    />
                  </div>
                );
              })}
              {error && (
                <div className="md:col-span-2 text-sm text-red-400/90">{error}</div>
              )}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? labels.sending : props.form.submit[lang]}
                </button>
              </div>
            </form>
          )}

        </div>
      </section>
    </>
  );
}
