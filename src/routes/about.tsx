import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import heroSunset from "@/assets/about-hero-sunset.png";
import { Users, Handshake, Crown, ArrowRight, Car, MapPin, Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Über uns — OBRENT Ludwigshafen am Rhein" },
      { name: "description", content: "OBRENT — Exzellenz, Leidenschaft, Premium Mobility. Luxus-Autovermietung aus Ludwigshafen am Rhein." },
      { property: "og:title", content: "Über uns — OBRENT" },
      { property: "og:description", content: "Exzellenz. Leidenschaft. Premium Mobility." },
    ],
  }),
  component: AboutPage,
});

const TOTAL_SECTIONS = 4;

function AboutPage() {
  const { t } = useI18n();
  const STAT_ICONS = [Car, MapPin, Star];
  const VALUE_ICONS = [Users, Handshake, Crown];
  const [section, setSection] = useState(0);
  const lastNav = useRef(0);

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

  useEffect(() => {
    let cooldown = 0;
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      const scrollable = target?.closest("[data-allow-scroll]") as HTMLElement | null;
      if (scrollable) {
        const canScrollDown = scrollable.scrollTop + scrollable.clientHeight < scrollable.scrollHeight - 1;
        const canScrollUp = scrollable.scrollTop > 0;
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) return;
      }
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

  return (
    <SiteLayout>
      <div
        className="fixed inset-0 top-24 md:top-32 z-30 overflow-hidden bg-background"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* SECTION 1 — HERO */}
        <SectionWrap active={section === 0}>
          <div className="absolute inset-0">
            <img
              src={heroSunset}
              alt="OBRENT Premium Fleet bei Sonnenuntergang"
              className="w-full h-full object-cover object-center"
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-white/30 dark:bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-white/40 dark:from-transparent dark:via-black/20 dark:to-black/80" />
          </div>
          <div className="relative h-full max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center">
            <div className="text-[0.7rem] tracking-[0.32em] uppercase text-gold mb-6">
              {t.about.eyebrow}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-onyx dark:text-cream leading-[0.95] max-w-4xl">
              {t.about.headline1}<br />
              {t.about.headline2}<br />
              <span className="text-gold italic font-light">{t.about.headlineItalic}</span>
            </h1>
            <p className="mt-6 md:mt-8 text-base md:text-lg text-onyx/80 dark:text-cream/75 font-light max-w-2xl leading-relaxed">
              {t.about.intro}
            </p>
          </div>
          <PulseArrow onClick={next} />
        </SectionWrap>

        {/* SECTION 2 — STORY + STATS */}
        <SectionWrap active={section === 1}>
          <div className="absolute inset-0 bg-background" />
          <div className="relative h-full max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center py-24 md:py-28 overflow-y-auto" data-allow-scroll>
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              <div className="lg:col-span-5">
                <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem]">{t.about.historyEyebrow}</p>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-5 leading-[1.05] text-foreground">
                  {t.about.historyTitle}<br />
                  <span className="text-gold italic font-light">{t.about.historyTitleItalic}</span>
                </h2>
                <div className="mt-8 hidden lg:block h-32 w-px bg-gradient-to-b from-gold/60 to-transparent" />
              </div>

              <div className="lg:col-span-7 space-y-5 text-foreground/75 text-base md:text-lg leading-[1.85] font-light">
                <p>{t.about.historyP1}</p>
                <p>{t.about.historyP2}</p>

                <div className="grid grid-cols-3 gap-6 md:gap-6 pt-8">
                  {t.about.stats.map(({ value, label }, i) => {
                    const Icon = STAT_ICONS[i];
                    return (
                      <div key={label} className="flex flex-col items-center text-center">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-gold mb-4" strokeWidth={1.5} />
                        <div className="font-display text-2xl md:text-4xl text-foreground mb-2">{value}</div>
                        <div className="text-[0.6rem] md:text-[0.65rem] tracking-[0.28em] uppercase text-muted-foreground leading-relaxed">{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <NavArrows onPrev={prev} onNext={next} />
        </SectionWrap>

        {/* SECTION 3 — VALUES */}
        <SectionWrap active={section === 2}>
          <div className="absolute inset-0 bg-muted/30" />
          <div className="relative h-full max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center py-24 md:py-28 overflow-y-auto" data-allow-scroll>
            <div className="text-center mb-10 md:mb-14">
              <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem]">{t.about.valuesEyebrow}</p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-5 text-foreground">{t.about.valuesTitle}</h2>
              <div className="mx-auto mt-6 h-px w-14 bg-gold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
              {t.about.values.map(({ title, body }, i) => {
                const Icon = VALUE_ICONS[i];
                return (
                  <div
                    key={title}
                    style={{ animationDelay: `${i * 120}ms` }}
                    className={cn(
                      "group text-center p-7 md:p-10 rounded-2xl border border-border bg-card/60 hover:border-gold/40 transition-colors",
                      section === 2 ? "opacity-0 animate-[fade-in_0.6s_ease-out_forwards]" : "opacity-0",
                    )}
                  >
                    <div className="mx-auto w-12 h-12 md:w-14 md:h-14 rounded-full border border-gold/40 flex items-center justify-center mb-6 transition-colors group-hover:border-gold group-hover:bg-gold/5">
                      <Icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl tracking-wide mb-3 text-foreground">{title}</h3>
                    <p className="text-muted-foreground font-light text-sm md:text-[0.95rem] leading-[1.8]">{body}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <NavArrows onPrev={prev} onNext={next} />
        </SectionWrap>

        {/* SECTION 4 — CTA */}
        <SectionWrap active={section === 3}>
          <div className="absolute inset-0">
            <img
              src={heroSunset}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-30 dark:opacity-25"
            />
            <div className="absolute inset-0 bg-white/40 dark:bg-onyx/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent dark:from-onyx dark:via-onyx/80 dark:to-onyx/30" />
          </div>
          <div className="relative h-full max-w-[1280px] mx-auto w-full px-6 md:px-12 flex flex-col justify-center">
            <div className="max-w-2xl">
              <p className="text-gold tracking-[0.32em] uppercase text-[0.7rem] mb-6">
                {t.about.ctaEyebrow}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-[1.05] text-foreground">
                {t.about.ctaTitle}<br />
                <span className="text-gold italic font-light">{t.about.ctaTitleItalic}</span>
              </h2>
              <p className="mt-6 text-foreground/75 text-base md:text-lg font-light">
                {t.about.ctaLead}
              </p>
              <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/fleet"
                  className="group inline-flex items-center gap-3 bg-gold text-cream px-7 py-4 text-xs tracking-[0.28em] uppercase font-medium hover:bg-gold/90 transition-colors"
                >
                  {t.about.ctaFleet}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 border border-foreground/30 text-foreground px-7 py-4 text-xs tracking-[0.28em] uppercase font-medium hover:border-gold hover:text-gold transition-colors"
                >
                  {t.about.ctaContact}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
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

        {/* DOT NAV */}
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
    </SiteLayout>
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
