import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice } from "@/lib/vehicles";
import { useVehicles } from "@/lib/useVehicles";
import { useI18n } from "@/lib/i18n";
const heroImage = "/hero-fleet-sunset.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein" },
      { name: "description", content: "OBRENT vermietet Premium-Fahrzeuge von Porsche, BMW und Audi in Ludwigshafen am Rhein — fair, schnell verfügbar und persönlich übergeben." },
      { property: "og:title", content: "OBRENT — Luxus Autovermietung Ludwigshafen am Rhein" },
      { property: "og:description", content: "Premium-Fahrzeuge zur Miete in Ludwigshafen am Rhein — Porsche, BMW, Audi." },
    ],
  }),
  component: HomePage,
});



function HomePage() {
  const { t } = useI18n();
  const { vehicles } = useVehicles();
  const cats = t.categories as Record<string, string>;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [paused, setPaused] = useState(false);
  const sortedVehicles = [...vehicles].sort((a, b) => b.pricePerDay - a.pricePerDay);
  const loopVehicles = sortedVehicles.length > 0 ? [...sortedVehicles, ...sortedVehicles] : [];

  // Auto-scroll loop (sub-pixel accumulator for smooth motion)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || vehicles.length === 0) return;
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft;
    const speed = 55; // px per second
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
  }, [paused, vehicles.length]);

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
      // Only capture once we know it's a drag, so simple clicks still reach the link
      try { scrollerRef.current.setPointerCapture(e.pointerId); } catch {}
      scrollerRef.current.scrollLeft = drag.current.startScroll - dx;
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    try { scrollerRef.current?.releasePointerCapture(e.pointerId); } catch {}
  };
  const scrollByDir = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative h-screen min-h-[720px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-onyx/70 via-onyx/40 to-onyx" />
        <div className="absolute inset-0 bg-onyx/30" />

        <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center">
          <div className="max-w-3xl fade-up">
            <div className="flex items-center gap-4 mb-8">
              <span className="gold-rule" />
              <span className="eyebrow">{t.home.eyebrow}</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1] text-cream tracking-tight max-w-3xl">
              {t.home.heroTitle} <span className="text-gold italic font-light">{t.home.heroTitleItalic}</span>{t.home.heroTitleRest}
            </h1>
            <p className="mt-10 text-lg md:text-xl text-cream/75 font-light max-w-xl leading-relaxed">
              {t.home.heroLead}
            </p>
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

      {/* FEATURED FLEET */}
      <section className="py-32 md:py-40 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="gold-rule" />
                <span className="eyebrow">{t.home.collectionEyebrow}</span>
              </div>
              <h2 className="font-display text-5xl md:text-7xl text-cream leading-[1] max-w-2xl">
                {t.home.featuredTitle} <span className="italic text-gold/90 font-light">{t.home.featuredItalic}</span>
              </h2>
            </div>
            <Link to="/fleet" className="text-[0.7rem] tracking-[0.3em] uppercase text-gold border-b border-gold/40 pb-1 hover:border-gold transition self-start md:self-auto">
              {t.common.viewAll}
            </Link>
          </div>

          <div className="relative">
            {/* Arrows */}
            <button
              type="button"
              aria-label="Vorherige"
              onClick={() => scrollByDir(-1)}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-onyx/70 backdrop-blur border border-cream/15 text-cream hover:text-gold hover:border-gold/50 transition"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Nächste"
              onClick={() => scrollByDir(1)}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-onyx/70 backdrop-blur border border-cream/15 text-cream hover:text-gold hover:border-gold/50 transition"
            >
              →
            </button>

            <div
              ref={scrollerRef}
              onPointerDown={(e) => { setPaused(true); onPointerDown(e); }}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="flex gap-6 md:gap-8 overflow-x-auto pb-4 -mx-6 md:-mx-12 px-6 md:px-12 cursor-grab active:cursor-grabbing select-none snap-x snap-mandatory md:snap-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ touchAction: "pan-y", scrollPaddingLeft: "1.5rem", scrollPaddingRight: "1.5rem" }}
            >
              {loopVehicles.map((v, i) => (
                <Link
                  key={`${v.id}-${i}`}
                  to="/fleet/$vehicleId"
                  params={{ vehicleId: v.id }}
                  onClick={(e) => { if (drag.current.moved) { e.preventDefault(); } }}
                  draggable={false}
                  className="glass-card group overflow-hidden flex flex-col shrink-0 snap-center w-[85vw] max-w-[320px] sm:w-[60%] sm:max-w-none md:w-[calc((100%-4rem)/3)]"
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
                      <div>
                        <div className="font-display text-lg italic" style={{ color: "#B8975A" }}>Preis auf Anfrage</div>
                      </div>
                      <span className="text-xs tracking-[0.28em] uppercase text-cream/60 group-hover:text-gold transition">{t.common.reserve} →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INVITATION */}
      <section className="py-32 md:py-40 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="eyebrow mb-8">{t.home.invitationEyebrow}</div>
          <h2 className="font-display text-4xl md:text-6xl text-cream leading-[1.1] mb-10">
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
