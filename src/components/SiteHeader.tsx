import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/assets/obrent-logo-header.png";

export function SiteHeader() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const services = [
    { hash: "vip-shuttle", label: t.servicesMenu.vipShuttle },
    { hash: "chauffeur-service", label: t.servicesMenu.chauffeur },
    { hash: "business-langzeitmiete", label: t.servicesMenu.longterm },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-onyx/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-24 md:h-32 flex items-center justify-between">
        <Link to="/" className="flex items-center group" aria-label="OBRENT">
          <img src={logo} alt="OBRENT — Luxus Autovermietung" className="h-20 md:h-28 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-12">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold transition-colors duration-300"
            activeProps={{ className: "text-gold" }}
          >
            {t.nav.home}
          </Link>
          <Link
            to="/fleet"
            className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold transition-colors duration-300"
            activeProps={{ className: "text-gold" }}
          >
            {t.nav.fleet}
          </Link>

          <div
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <Link
              to="/services"
              className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold transition-colors duration-300"
              activeProps={{ className: "text-gold" }}
            >
              {t.nav.services}
            </Link>
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-all duration-200 ${
                servicesOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
            >
              <div className="min-w-[260px] bg-[#111111] border border-gold/30 shadow-xl py-3">
                {services.map((s) => (
                  <Link
                    key={s.hash}
                    to="/services"
                    hash={s.hash}
                    onClick={() => setServicesOpen(false)}
                    className="block px-5 py-3 text-[0.7rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold hover:bg-white/5 transition-colors"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/about"
            className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold transition-colors duration-300"
            activeProps={{ className: "text-gold" }}
          >
            {t.nav.about}
          </Link>
          <Link
            to="/contact"
            className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold transition-colors duration-300"
            activeProps={{ className: "text-gold" }}
          >
            {t.nav.contact}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />
          <span className="h-3 w-px bg-cream/20" />
          <ThemeToggle />
        </div>

        <button
          aria-label="Open menu"
          className="md:hidden text-cream"
          onClick={() => setOpen((s) => !s)}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`h-px bg-cream transition-transform ${open ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`h-px bg-cream transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-px bg-cream transition-transform ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-onyx/95 backdrop-blur-xl border-t border-border">
          <nav className="flex flex-col px-6 py-8 gap-6">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm tracking-[0.28em] uppercase text-cream/80 hover:text-gold">
              {t.nav.home}
            </Link>
            <Link to="/fleet" onClick={() => setOpen(false)} className="text-sm tracking-[0.28em] uppercase text-cream/80 hover:text-gold">
              {t.nav.fleet}
            </Link>
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen((s) => !s)}
                className="w-full flex items-center justify-between text-sm tracking-[0.28em] uppercase text-cream/80 hover:text-gold"
              >
                <span>{t.nav.services}</span>
                <span className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}>▾</span>
              </button>
              {mobileServicesOpen && (
                <div className="mt-4 pl-4 border-l border-gold/30 flex flex-col gap-4">
                  <Link
                    to="/services"
                    onClick={() => setOpen(false)}
                    className="text-xs tracking-[0.28em] uppercase text-cream/70 hover:text-gold"
                  >
                    {t.nav.services} —
                  </Link>
                  {services.map((s) => (
                    <Link
                      key={s.hash}
                      to="/services"
                      hash={s.hash}
                      onClick={() => setOpen(false)}
                      className="text-xs tracking-[0.28em] uppercase text-cream/70 hover:text-gold"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/about" onClick={() => setOpen(false)} className="text-sm tracking-[0.28em] uppercase text-cream/80 hover:text-gold">
              {t.nav.about}
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="text-sm tracking-[0.28em] uppercase text-cream/80 hover:text-gold">
              {t.nav.contact}
            </Link>
            <div className="pt-4 border-t border-border flex items-center gap-6">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
