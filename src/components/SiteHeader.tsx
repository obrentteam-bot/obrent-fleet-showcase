import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { zeroRightClassName } from "react-remove-scroll-bar";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/assets/obrent-logo-header.webp";

export function SiteHeader() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Routes whose hero sits beneath the transparent header on a dark photo
  // background. Only force light header text in dark mode; in light mode
  // we keep the regular dark text so the navbar stays legible.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const darkHeroRoutes = ["/", "/about", "/vip-shuttle", "/chauffeur-service", "/business-langzeitmiete"];
  const overDarkHero = !scrolled && darkHeroRoutes.includes(pathname);

  const navLinkBase = "text-[0.7rem] tracking-[0.28em] uppercase transition-colors duration-300";
  const navLinkColor = overDarkHero ? "text-cream hover:text-gold" : "text-cream/70 hover:text-gold";


  const services = [
    { path: "/vip-shuttle" as const, label: t.servicesMenu.vipShuttle, desc: t.servicesMenu.vipShuttleDesc },
    { path: "/chauffeur-service" as const, label: t.servicesMenu.chauffeur, desc: t.servicesMenu.chauffeurDesc },
    { path: "/business-langzeitmiete" as const, label: t.servicesMenu.longterm, desc: t.servicesMenu.longtermDesc },
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
      data-site-header
      data-over-dark={overDarkHero ? "true" : undefined}
      className={`${zeroRightClassName} fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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
            className={`${navLinkBase} ${navLinkColor}`}
            activeProps={{ className: "text-gold" }}
          >
            {t.nav.home}
          </Link>
          <Link
            to="/fleet"
            className={`${navLinkBase} ${navLinkColor}`}
            activeProps={{ className: "text-gold" }}
          >
            {t.nav.fleet}
          </Link>

          <div
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              onClick={() => setServicesOpen((s) => !s)}
              className={`${navLinkBase} ${navLinkColor}`}
            >
              {t.nav.services}
            </button>
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 transition-all duration-300 ease-out ${
                servicesOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="relative w-[440px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-[#B8975A]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Top accent edge */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#B8975A]/60 to-transparent" />

                <div className="p-2">
                  {services.map((s, i) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      onClick={() => setServicesOpen(false)}
                      className="group block relative p-6 transition-all duration-500 hover:bg-[#B8975A]/10"
                    >
                      <div className="flex items-start gap-6">
                        <span className="font-display text-[#B8975A] text-xl italic opacity-60 group-hover:opacity-100 transition-opacity duration-500 select-none leading-none mt-1">
                          0{i + 1}
                        </span>
                        <div className="flex flex-col gap-1.5">
                          <h3 className="text-[#F5F0E8] text-[0.78rem] font-medium tracking-[0.25em] uppercase transition-all duration-500 group-hover:translate-x-2 group-hover:text-[#B8975A]">
                            {s.label}
                          </h3>
                          <p className="text-[#F5F0E8]/50 text-[11px] leading-relaxed tracking-wide group-hover:text-[#F5F0E8]/75 transition-colors duration-500 normal-case">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                      {/* Animated bottom underline */}
                      <div className="absolute bottom-0 left-6 right-6 h-px bg-[#B8975A]/15">
                        <div className="h-full w-0 bg-[#B8975A] group-hover:w-full transition-all duration-700 ease-out" />
                      </div>

                    </Link>
                  ))}
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none opacity-20">
                  <div className="absolute top-[-25px] right-[-25px] w-12 h-12 rotate-45 border border-gold" />
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/about"
            className={`${navLinkBase} ${navLinkColor}`}
            activeProps={{ className: "text-gold" }}
          >
            {t.nav.about}
          </Link>
          <Link
            to="/contact"
            className={`${navLinkBase} ${navLinkColor}`}
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
                  {services.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
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
