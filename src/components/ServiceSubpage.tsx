import { Link } from "@tanstack/react-router";
import { useState, ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { ChevronRight, ArrowLeft, Clock, ShieldCheck, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SelectFieldDef = {
  type: "select";
  key: string;
  label: { de: string; en: string };
  placeholder: { de: string; en: string };
  colSpan?: 1 | 2;
  options: { value: string; label: { de: string; en: string } }[];
};

type TextFieldDef = {
  type: "text" | "tel" | "email" | "number" | "datetime-local" | "date" | "textarea";
  key: string;
  label: { de: string; en: string };
  required?: boolean;
  colSpan?: 1 | 2;
  placeholder?: { de: string; en: string };
};

export type FieldDef = TextFieldDef | SelectFieldDef;

export type ServiceSubpageProps = {
  serviceKey: "vip-shuttle" | "chauffeur-service" | "business-langzeitmiete";
  bgImage: string;
  copy: {
    de: SubpageCopy;
    en: SubpageCopy;
  };
  fields: FieldDef[];
  submitLabel: { de: string; en: string };
};

type SubpageCopy = {
  crumb: string;
  title: string;
  subline: string;
  whatTitle: string;
  whatItems: string[];
  whyTagline: string;
  whyCards: { title: string; body: string }[];
  formEyebrow: string;
  formTitle: string;
  formItalic: string;
  formLead: string;
  back: string;
  servicesLabel: string;
  successMsg: string;
};

const ICONS = [Clock, ShieldCheck, Sparkles];

export function ServiceSubpage({ serviceKey, bgImage, copy, fields, submitLabel }: ServiceSubpageProps) {
  const { lang } = useI18n();
  const c = copy[lang];

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setVal = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const today = new Date().toISOString().slice(0, 10);
    const lines = fields
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
    const body = `Service: ${c.title}\n${lines}`;
    const { error: insErr } = await supabase.from("bookings").insert({
      vehicle_id: null,
      customer_name: values["name"] || values["contact"] || values["company"] || "—",
      email: values["email"] || "",
      phone: values["phone"] || "",
      start_date: today,
      end_date: today,
      message: body,
      status: "pending",
    });
    setSubmitting(false);
    if (insErr) setError(insErr.message);
    else setSubmitted(true);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-end pt-40 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-onyx/80 via-onyx/70 to-onyx" />
        </div>
        <div className="relative max-w-[1100px] mx-auto w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-[0.7rem] tracking-[0.25em] uppercase">
            <Link to="/services" className="text-gold/70 hover:text-gold transition-colors">
              {c.servicesLabel}
            </Link>
            <ChevronRight className="w-3 h-3 text-gold/50" />
            <span className="text-gold">{c.crumb}</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95]">
            {c.title}
          </h1>
          <p className="mt-8 text-lg text-cream/70 font-light max-w-2xl leading-relaxed">
            {c.subline}
          </p>
          <div className="mt-12 h-px w-24 bg-gold/60" />
        </div>
      </section>

      {/* WHAT IS INCLUDED */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[900px] mx-auto">
          <h2 className="font-display text-3xl md:text-5xl text-foreground leading-tight mb-12">
            {c.whatTitle}
          </h2>
          <ul className="space-y-5">
            {c.whatItems.map((item) => (
              <li key={item} className="flex items-start gap-5 group">
                <span className="mt-3 h-px w-8 bg-gold flex-shrink-0 transition-all duration-500 group-hover:w-14" />
                <span className="text-foreground/80 text-lg font-light">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WHY OBRENT */}
      <section className="py-24 px-6 md:px-12 bg-onyx/40 border-y border-border/40">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-display italic text-2xl md:text-3xl text-gold/90 text-center mb-16 tracking-wide">
            {c.whyTagline}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {c.whyCards.map((card, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <article
                  key={card.title}
                  className="border border-border/60 bg-[#1A1A1A] p-8 lg:p-10 transition-all duration-500 hover:border-gold/60"
                >
                  <Icon className="w-8 h-8 text-gold mb-6" strokeWidth={1.25} />
                  <h3 className="font-display text-xl text-cream leading-tight mb-3">
                    {card.title}
                  </h3>
                  <p className="text-cream/60 text-sm leading-relaxed font-light">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[900px] mx-auto">
          <div className="flex justify-center mb-16">
            <span className="h-px w-32 bg-gold/60" />
          </div>
          <div className="text-center mb-14">
            <div className="text-[0.7rem] tracking-[0.28em] uppercase text-gold/80 mb-6">
              {c.formEyebrow}
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-foreground leading-[0.95] mb-6">
              {c.formTitle}{" "}
              <span className="italic text-gold/90 font-light">{c.formItalic}</span>
            </h2>
            <p className="text-foreground/60 font-light max-w-xl mx-auto">{c.formLead}</p>
          </div>

          {submitted ? (
            <div className="py-16 border border-gold/30 bg-onyx/40 text-center">
              <div className="text-[0.7rem] tracking-[0.28em] uppercase text-gold mb-4">✓</div>
              <p className="text-foreground/80">{c.successMsg}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              {fields.map((f) => {
                const span = f.colSpan === 2 ? "md:col-span-2" : "";
                if (f.type === "select") {
                  return (
                    <div key={f.key} className={span}>
                      <label className="lux-label">{f.label[lang]}</label>
                      <Select value={values[f.key] || ""} onValueChange={(v) => setVal(f.key, v)}>
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
              {error && <div className="md:col-span-2 text-sm text-red-400/90">{error}</div>}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "…" : submitLabel[lang]}
                </button>
              </div>
            </form>
          )}

          {/* Back link */}
          <div className="mt-20 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.28em] uppercase text-gold/70 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              {c.back}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function SubpageMeta({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
