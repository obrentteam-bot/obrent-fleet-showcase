import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { submitBooking } from "@/lib/submitBooking";
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
  serviceTitleEn: string;
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

const TOTAL_SECTIONS = 4;

export function ServiceSubpage(props: ServiceSubpageProps) {
  const { lang } = useI18n();
  const labels = PAGE_LABELS[lang];

  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState(0);
  const lastNav = useRef(0);

  const setVal = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));
  const dateLocale = lang === "de" ? de : enUS;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Body scroll lock while these one-pager pages are mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const goTo = (i: number) => {
    const now = Date.now();
    if (now - lastNav.current < 350) return;
    lastNav.current = now;
    setSection(Math.max(0, Math.min(TOTAL_SECTIONS - 1, i)));
  };
  const next = () => goTo(section + 1);
  const prev = () => goTo(section - 1);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [section]);

  // Touch swipe
  const touchStart = useRef<{ y: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dy) < 50) return;
    if (dy < 0) next();
    else prev();
  };

  // Wheel navigation (desktop trackpads / mouse wheel)
  useEffect(() => {
    let cooldown = 0;
    const onWheel = (e: WheelEvent) => {
      // Allow scrolling within the form section (id="form-scroll")
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-allow-scroll]")) return;
      e.preventDefault();
      const now = Date.now();
      if (now - cooldown < 700) return;
      if (Math.abs(e.deltaY) < 20) return;
      cooldown = now;
      if (e.deltaY > 0) next();
      else prev();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [section]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const todayIso = new Date().toISOString().slice(0, 10);
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
      customer_name: values["name"] || values["contact"] || values["company"] || "—",
      email: values["email"] || "",
      phone: values["phone"] || "",
      start_date: todayIso,
      end_date: todayIso,
      message: body,
      status: "pending",
    });
    setSubmitting(false);
    if (insErr) setError(insErr);
    else {
      setSubmitted(true);
    }
  };

  const renderField = (f: FieldDef) => {
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
            rows={4}
            value={values[f.key] || ""}
            onChange={(e) => setVal(f.key, e.target.value)}
          />
        </div>
      );
    }
    if (f.type === "date") {
      const v = values[f.key];
      const dateVal = v ? new Date(v) : undefined;
      return (
        <div key={f.key} className={span}>
          <label className="lux-label">{f.label[lang]}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-transparent border-border text-foreground hover:bg-foreground/5 hover:text-foreground",
                  !dateVal && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                {dateVal ? (
                  format(dateVal, "PPP", { locale: dateLocale })
                ) : (
                  <span>{lang === "de" ? "Datum wählen" : "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateVal}
                onSelect={(d) => setVal(f.key, d ? format(d, "yyyy-MM-dd") : "")}
                disabled={(date) => date < today}
                initialFocus
                locale={dateLocale}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }
    if (f.type === "time") {
      return (
        <div key={f.key} className={span}>
          <label className="lux-label">{f.label[lang]}</label>
          <TimeSelect
            value={values[f.key] || ""}
            onChange={(v) => setVal(f.key, v)}
            ariaLabel={f.label[lang]}
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
  };

  return (
    <div
      className="fixed inset-0 top-24 md:top-32 z-30 overflow-hidden bg-background"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* SECTION 1 — HERO */}
      <SectionWrap active={section === 0}>
        <div className="absolute inset-0">
          <img
            src={props.bgImage}
            alt=""
            className="w-full h-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>
        <div className="relative h-full max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center">
          <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold mb-6">
            {props.hero.eyebrow[lang]}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] max-w-4xl">
            {props.hero.headline[lang]}
          </h1>
          <p className="mt-6 md:mt-8 text-base md:text-lg text-cream/75 font-light max-w-2xl leading-relaxed">
            {props.hero.subline[lang]}
          </p>
          <div className="mt-10">
            <button onClick={() => goTo(3)} className="btn-gold">
              {props.hero.cta[lang]}
            </button>
          </div>
        </div>
        <PulseArrow onClick={next} />
      </SectionWrap>

      {/* SECTION 2 — LEISTUNGEN */}
      <SectionWrap active={section === 1}>
        <div className="absolute inset-0 bg-background" />
        <div className="relative h-full max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center py-24 md:py-28">
          <div className="mb-10 md:mb-14">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight inline-block">
              {props.leistungen.title[lang]}
              <span className="block h-px w-24 bg-gold/70 mt-4" />
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
            {props.leistungen.cards.map(({ Icon, label }, i) => (
              <article
                key={label.en}
                style={{ animationDelay: `${i * 100}ms` }}
                className={cn(
                  "group border border-border bg-card/60 p-4 sm:p-7 md:p-8 transition-all duration-500 hover:border-gold/60 hover:-translate-y-0.5 rounded-lg",
                  section === 1 ? "opacity-0 animate-[fade-in_0.6s_ease-out_forwards]" : "opacity-0",
                )}
              >
                <Icon
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gold mb-3 sm:mb-5 md:mb-6 transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1.25}
                />
                <h3 className="font-display text-sm sm:text-lg md:text-xl text-foreground leading-tight">
                  {label[lang]}
                </h3>
              </article>
            ))}
          </div>
        </div>
        <NavArrows onPrev={prev} onNext={next} />
      </SectionWrap>

      {/* SECTION 3 — WHY OBRENT */}
      <SectionWrap active={section === 2}>
        <div className="absolute inset-0 bg-muted/30" />
        <div className="relative h-full max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center py-24 md:py-28">
          <div className="text-center mb-10 md:mb-14">
            <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold/80 mb-5">
              {lang === "de" ? "Warum OBRENT" : "Why OBRENT"}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl text-foreground leading-tight max-w-3xl mx-auto">
              {props.why.title[lang]}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
            {props.why.cards.map(({ Icon, title, body }, i) => (
              <article
                key={title.en}
                style={{ animationDelay: `${i * 120}ms` }}
                className={cn(
                  "border border-border bg-card/60 p-6 sm:p-8 md:p-9 transition-all duration-500 hover:border-gold/60 rounded-lg",
                  section === 2 ? "opacity-0 animate-[fade-in_0.6s_ease-out_forwards]" : "opacity-0",
                )}
              >
                <Icon className="w-7 h-7 md:w-8 md:h-8 text-gold mb-5" strokeWidth={1.25} />
                <h3 className="font-display text-xl md:text-2xl text-foreground leading-tight mb-2">
                  {title[lang]}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">{body[lang]}</p>
              </article>
            ))}
          </div>
        </div>
        <NavArrows onPrev={prev} onNext={next} />
      </SectionWrap>

      {/* SECTION 4 — FORM */}
      <SectionWrap active={section === 3}>
        <div className="absolute inset-0 bg-background" />
        <div className="relative h-full w-full overflow-y-auto" data-allow-scroll>
          <div className="max-w-[820px] mx-auto px-6 md:px-12 py-20 md:py-24">
            <div className="flex justify-center mb-8">
              <span className="h-px w-24 bg-gold/60" />
            </div>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl sm:text-4xl md:text-6xl text-foreground leading-[0.95]">
                {props.form.title[lang]}
              </h2>
            </div>

            {submitted ? (
              <div className="py-14 border border-gold/30 bg-card/60 text-center rounded-lg">
                <div className="text-[0.7rem] tracking-[0.28em] uppercase text-gold mb-4">✓</div>
                <p className="text-foreground/80">{labels.success}</p>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
              >
                {props.form.fields.map(renderField)}
                {error && (
                  <div className="md:col-span-2 text-sm text-red-400/90">{error}</div>
                )}
                <div className="md:col-span-2 pt-2">
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
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous section"
            className="w-11 h-11 rounded-full border border-gold/40 text-gold/80 hover:text-gold hover:border-gold flex items-center justify-center transition bg-background/60 backdrop-blur"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>
      </SectionWrap>

      {/* DOT NAV (right side) */}
      <div className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
        {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to section ${i + 1}`}
            onClick={() => goTo(i)}
            className={cn(
              "transition-all duration-500 rounded-full",
              section === i
                ? "w-3 h-3 bg-gold shadow-[0_0_12px_rgba(184,151,90,0.6)]"
                : "w-2 h-2 bg-transparent border border-foreground/40 hover:border-gold",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function SectionWrap({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <section
      aria-hidden={!active}
      className={cn(
        "absolute inset-0 transition-all duration-[600ms] ease-out overflow-hidden",
        active
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-5 pointer-events-none",
      )}
    >
      {children}
    </section>
  );
}

function NavArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous section"
        className="w-11 h-11 rounded-full border border-gold/40 text-gold/80 hover:text-gold hover:border-gold flex items-center justify-center transition bg-background/60 backdrop-blur"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next section"
        className="w-11 h-11 rounded-full border border-gold/40 text-gold/80 hover:text-gold hover:border-gold flex items-center justify-center transition bg-background/60 backdrop-blur"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}

function PulseArrow({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Next section"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full border border-gold/50 text-gold flex items-center justify-center bg-background/50 backdrop-blur animate-bounce hover:border-gold hover:bg-background/80 transition"
    >
      <ChevronDown className="w-6 h-6" />
    </button>
  );
}
