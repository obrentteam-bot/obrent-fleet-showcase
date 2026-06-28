import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, ShieldCheck, Zap, MapPin } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice } from "@/lib/vehicles";
import { useVehicles } from "@/lib/useVehicles";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/useSettings";

const heroImage = "/hero-fleet-sunset.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein" },
      { name: "description", content: "OBRENT — Luxus Autovermietung in Ludwigshafen am Rhein. Exklusive Fahrzeuge, persönliche Übergabe, flexible Mietlaufzeiten." },
      { property: "og:title", content: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein" },
      { property: "og:description", content: "OBRENT — Luxus Autovermietung in Ludwigshafen am Rhein. Exklusive Fahrzeuge, persönliche Übergabe." },
    ],
  }),
  component: HomePage,
});



function HomePage() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const { vehicles } = useVehicles();

  const cats = t.categories as Record<string, string>;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);
  const pauseForInteraction = (resumeAfterMs = 4000) => {
    setPaused(true);
    if (resumeTimer.current) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    if (resumeAfterMs > 0) {
      resumeTimer.current = window.setTimeout(() => {
        setPaused(false);
        resumeTimer.current = null;
      }, resumeAfterMs);
    }
  };
  const resumeNow = () => {
    if (resumeTimer.current) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    setPaused(false);
  };
  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);
  const sortedVehicles = [...vehicles].sort((a, b) => b.pricePerDay - a.pricePerDay);
  // Visuelle Verdopplung NUR für die nahtlose Marquee-Animation.
  // Die echte Anzahl bleibt sortedVehicles.length — Pfeile/Index arbeiten auf dieser.
  const loopVehicles = sortedVehicles.length > 0 ? [...sortedVehicles, ...sortedVehicles] : [];

  // Smooth continuous auto-scroll (RAF, sub-pixel)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || sortedVehicles.length === 0) return;
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    const speed = 55; // px/s
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!paused && !drag.current.active) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          pos += speed * dt;
          if (pos >= half) pos -= half;
          el.scrollLeft = pos;
        }
      } else {
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, sortedVehicles.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || !scrollerRef.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 6) {
      drag.current.moved = true;
      try { scrollerRef.current.setPointerCapture(e.pointerId); } catch {}
      scrollerRef.current.scrollLeft = drag.current.startScroll - dx;
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    try { scrollerRef.current?.releasePointerCapture(e.pointerId); } catch {}
  };
  // Arrows: page-by-page scroll with seamless wrap via the duplicated tail
  const scrollByDir = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    pauseForInteraction(4000);
    const half = el.scrollWidth / 2;
    const step = el.clientWidth * 0.8;
    let target = el.scrollLeft + dir * step;
    // Wrap seamlessly within the first half (real vehicles)
    if (half > 0) {
      if (target < 0) {
        // jump to mirrored position in second half, then smooth-scroll left
        el.scrollLeft = target + half;
        target = el.scrollLeft + dir * step;
      } else if (target >= half) {
        el.scrollLeft = target - half;
        target = el.scrollLeft + dir * step;
      }
    }
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative h-screen min-h-[720px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-onyx" />
        {settings.hero_video_url ? (
          <video
            className="absolute inset-0 w-full h-full object-cover scale-105"
            src={settings.hero_video_url}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/70 via-onyx/40 to-onyx" />
        <div className="absolute inset-0 bg-onyx/30" />

        <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center">
          <div className="max-w-3xl fade-up">
            <div className="flex items-center gap-4 mb-8">
              <span className="gold-rule" />
              <span className="eyebrow">{t.home.eyebrow}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1] text-cream tracking-tight max-w-3xl">
              {t.home.heroTitle} <span className="text-gold italic font-light">{t.home.heroTitleItalic}</span>{t.home.heroTitleRest}
            </h1>
            {t.home.heroLead && (
              <p className="mt-10 text-lg md:text-xl text-cream/75 font-light max-w-xl leading-relaxed">
                {t.home.heroLead}
              </p>
            )}
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link to="/fleet" className="btn-gold">{t.home.ctaFleet}</Link>
              <Link to="/contact" className="btn-ghost">{t.home.ctaAppointment}</Link>
            </div>
          </div>

          <div className="absolute bottom-10 left-6 md:left-12 right-6 md:right-12 flex items-end justify-between text-cream/50">
            <div className="text-xs tracking-[0.3em] uppercase">{t.home.scroll}</div>
            <div className="hidden md:block text-xs tracking-[0.3em] uppercase">
              Ludwigshafen am Rhein · Deutschland
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="border-y border-cream/10 bg-onyx/60 py-14 md:py-16 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {[
            { Icon: Car, value: `${vehicles.length}+ Fahrzeuge`, label: "Premium-Flotte" },
            { Icon: ShieldCheck, value: "100% Seriös", label: "Diskret & vertraulich" },
            { Icon: Zap, value: "Sofort-Reaktion", label: "Schnelle Rückmeldung" },
            { Icon: MapPin, value: "Mannheim & Umgebung", label: "Persönliche Übergabe" },
          ].map(({ Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <Icon className="w-7 h-7 text-gold mb-4" strokeWidth={1.5} />
              <div className="font-display text-base md:text-lg text-cream leading-tight">{value}</div>
              <div className="mt-2 text-[0.6rem] md:text-[0.65rem] tracking-[0.28em] uppercase text-cream/50">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED FLEET */}
      <section className="py-32 md:py-40 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="gold-rule" />
                <span className="eyebrow">{t.home.collectionEyebrow}</span>
              </div>
              <h2 className="font-display text-2xl md:text-4xl text-cream leading-[1] max-w-2xl">
                {t.home.featuredTitle} <span className="italic text-gold/90 font-light">{t.home.featuredItalic}</span>
              </h2>
            </div>
            <Link to="/fleet" className="text-[0.7rem] tracking-[0.3em] uppercase text-gold border-b border-gold/40 pb-1 hover:border-gold transition self-start md:self-auto">
              {t.common.viewAll}
            </Link>
          </div>

          {/* DESKTOP / TABLET — marquee with arrows */}
          <div className="relative hidden md:block">
            <button
              type="button"
              aria-label="Vorherige"
              onClick={() => scrollByDir(-1)}
              className="flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-onyx/70 backdrop-blur border border-cream/15 text-cream hover:text-gold hover:border-gold/50 transition"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Nächste"
              onClick={() => scrollByDir(1)}
              className="flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-onyx/70 backdrop-blur border border-cream/15 text-cream hover:text-gold hover:border-gold/50 transition"
            >
              →
            </button>

            <div
              ref={scrollerRef}
              onPointerDown={(e) => { if (e.pointerType === "mouse") { setPaused(true); onPointerDown(e); } }}
              onPointerMove={(e) => { if (e.pointerType === "mouse") onPointerMove(e); }}
              onPointerUp={(e) => { if (e.pointerType === "mouse") onPointerUp(e); }}
              onPointerCancel={(e) => { if (e.pointerType === "mouse") onPointerUp(e); }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => resumeNow()}
              className="flex gap-8 overflow-x-auto pb-4 -mx-12 px-12 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {loopVehicles.map((v, i) => (
                <Link
                  key={`${v.id}-${i}`}
                  to="/fleet/$vehicleId"
                  params={{ vehicleId: v.id }}
                  preload="viewport"
                  onClick={(e) => { if (drag.current.moved) { e.preventDefault(); } }}
                  draggable={false}
                  aria-hidden={i >= sortedVehicles.length ? true : undefined}
                  className="glass-card group overflow-hidden flex flex-col shrink-0 w-[calc((100%-4rem)/3)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-jet">
                    {v.hasImages ? (
                      <img
                        src={v.image}
                        alt={v.name}
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110 pointer-events-none"
                        loading={i < 2 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[#B8975A] text-sm tracking-[0.2em] uppercase font-light">Bilder folgen in Kürze</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent" />
                    <div className="absolute top-5 left-5 eyebrow text-cream/70">{cats[v.category] ?? v.category}</div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="text-xs tracking-[0.28em] uppercase text-cream/45 mb-2">{v.marque}</div>
                    <h3 className="font-display text-3xl text-cream mb-4">{v.name}</h3>
                    <p className="text-sm text-cream/55 font-light italic mb-6 line-clamp-3 flex-1">{v.tagline}</p>
                    <div className="flex items-end justify-between pt-6 border-t border-border mt-auto">
                      <div className="font-display text-xl italic text-foreground">{settings.show_prices && v.pricePerDay > 0 ? `${formatPrice(v.pricePerDay)} / Tag` : "Preis auf Anfrage"}</div>
                      <span className="text-xs tracking-[0.28em] uppercase text-cream/60 group-hover:text-gold transition">{settings.cta_reserve_label || t.common.reserve} →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* MOBILE — index-based carousel with auto-advance + swipe */}
          <div className="md:hidden">
            <MobileVehicleCarousel
              vehicles={sortedVehicles}
              cats={cats}
              showPrices={settings.show_prices}
              ctaLabel={settings.cta_reserve_label || t.common.reserve}
            />
          </div>
        </div>
      </section>

      {/* INVITATION */}
      <section className="py-32 md:py-40 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="eyebrow mb-8">{t.home.invitationEyebrow}</div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-cream leading-[1.1] mb-10">
            {t.home.invitationTitle} <span className="italic text-gold/90 font-light">{t.home.invitationItalic}</span>.
          </h2>
          <p className="text-lg text-cream/60 font-light mb-12 leading-relaxed">
            {t.home.invitationLead}
          </p>
          <Link to="/contact" className="btn-gold">{t.home.invitationCta}</Link>
        </div>
      </section>
    </SiteLayout>
  );
}

type Vehicle = ReturnType<typeof useVehicles>["vehicles"][number];

function MobileVehicleCarousel({
  vehicles,
  cats,
  showPrices,
  ctaLabel,
}: {
  vehicles: Vehicle[];
  cats: Record<string, string>;
  showPrices: boolean;
  ctaLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef({ startX: 0, startY: 0, dx: 0, dragging: false, swiped: false });
  const [dragX, setDragX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const n = vehicles.length;

  // Auto-advance every 4.5s
  useEffect(() => {
    if (n <= 1 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 4500);
    return () => window.clearInterval(id);
  }, [n, paused]);

  const resumeTimer = useRef<number | null>(null);
  const pauseTemporarily = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 5000);
  };
  useEffect(() => () => { if (resumeTimer.current) window.clearTimeout(resumeTimer.current); }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const t0 = e.touches[0];
    touch.current = { startX: t0.clientX, startY: t0.clientY, dx: 0, dragging: true, swiped: false };
    setPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touch.current.dragging) return;
    const t0 = e.touches[0];
    const dx = t0.clientX - touch.current.startX;
    const dy = t0.clientY - touch.current.startY;
    if (Math.abs(dx) > Math.abs(dy)) {
      touch.current.dx = dx;
      setDragX(dx);
    }
  };
  const onTouchEnd = () => {
    const width = trackRef.current?.clientWidth ?? 1;
    const threshold = width * 0.18;
    const dx = touch.current.dx;
    if (Math.abs(dx) > threshold) {
      touch.current.swiped = true;
      if (dx < 0) setIndex((i) => (i + 1) % n);
      else setIndex((i) => (i - 1 + n) % n);
    }
    touch.current.dragging = false;
    touch.current.dx = 0;
    setDragX(0);
    pauseTemporarily();
  };

  if (n === 0) return null;

  return (
    <div className="relative">
      <div ref={trackRef} className="overflow-hidden -mx-6">
        <div
          className="flex"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
            transition: touch.current.dragging ? "none" : "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          {vehicles.map((v, i) => (
            <div key={v.id} className="w-full shrink-0 px-6">
              <Link
                to="/fleet/$vehicleId"
                params={{ vehicleId: v.id }}
                preload="viewport"
                onClick={(e) => { if (touch.current.swiped) { e.preventDefault(); touch.current.swiped = false; } }}
                draggable={false}
                className="glass-card group overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-jet">
                  {v.hasImages ? (
                    <img
                      src={v.image}
                      alt={v.name}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[#B8975A] text-sm tracking-[0.2em] uppercase font-light">Bilder folgen in Kürze</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent" />
                  <div className="absolute top-5 left-5 eyebrow text-cream/70">{cats[v.category] ?? v.category}</div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="text-xs tracking-[0.28em] uppercase text-cream/45 mb-2">{v.marque}</div>
                  <h3 className="font-display text-3xl text-cream mb-4">{v.name}</h3>
                  <p className="text-sm text-cream/55 font-light italic mb-6 line-clamp-3 flex-1">{v.tagline}</p>
                  <div className="flex items-end justify-between pt-6 border-t border-border mt-auto">
                    <div className="font-display text-xl italic text-foreground">
                      {showPrices && v.pricePerDay > 0 ? `${formatPrice(v.pricePerDay)} / Tag` : "Preis auf Anfrage"}
                    </div>
                    <span className="text-xs tracking-[0.28em] uppercase text-cream/60 group-hover:text-gold transition">{ctaLabel} →</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {vehicles.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => { setIndex(i); pauseTemporarily(); }}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-gold" : "w-1.5 bg-cream/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
