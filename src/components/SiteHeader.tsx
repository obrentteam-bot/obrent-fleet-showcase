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
  const darkHeroRoutes = ["/", "/about", "/vip-shuttle", "/chauffeur-service", "/business-langzeitmiete", "/contact"];
  const overDarkHero = !scrolled && darkHeroRoutes.includes(pathname);

  const navLinkBase = "text-[0.7rem] tracking-[0.28em] uppercase transition-colors duration-300";
  // Use foreground so it inverts properly with theme (dark in light mode, light in dark mode).
  // Only force light text when we're over a dark hero in dark mode.
  const navLinkColor = overDarkHero && theme === "dark"
    ? "text-cream hover:text-gold"
    : scrolled
      ? "text-foreground/75 hover:text-gold"
      : "text-foreground/85 hover:text-gold";


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

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

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
          className={`md:hidden ${overDarkHero && theme === "dark" ? "text-cream" : "text-foreground"}`}
          onClick={() => setOpen((s) => !s)}
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`h-px bg-current transition-transform ${open ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`h-px bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-px bg-current transition-transform ${open ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0A0A0A]/98 backdrop-blur-2xl flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between px-6 h-24">
            <Link to="/" onClick={() => setOpen(false)} aria-label="OBRENT">
              <img src={logo} alt="OBRENT" className="h-16 w-auto" />
            </Link>
            <button
              aria-label="Close menu"
              className="text-cream w-12 h-12 flex items-center justify-center -mr-3"
              onClick={() => setOpen(false)}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M3 3l16 16M19 3L3 19" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8 px-6 overflow-y-auto pb-12">
            <Link to="/" onClick={() => setOpen(false)} className="text-base tracking-[0.32em] uppercase text-cream/85 hover:text-gold">
              {t.nav.home}
            </Link>
            <Link to="/fleet" onClick={() => setOpen(false)} className="text-base tracking-[0.32em] uppercase text-cream/85 hover:text-gold">
              {t.nav.fleet}
            </Link>
            <div className="w-full max-w-xs text-center">
              <button
                type="button"
                onClick={() => setMobileServicesOpen((s) => !s)}
                className="w-full inline-flex items-center justify-center gap-3 text-base tracking-[0.32em] uppercase text-cream/85 hover:text-gold"
              >
                <span>{t.nav.services}</span>
                <span className={`transition-transform text-sm ${mobileServicesOpen ? "rotate-180" : ""}`}>▾</span>
              </button>
              {mobileServicesOpen && (
                <div className="mt-5 flex flex-col gap-4">
                  {services.map((s) => (
                    <Link
                      key={s.path}
                      to={s.path}
                      onClick={() => setOpen(false)}
                      className="text-sm tracking-[0.28em] uppercase text-cream/65 hover:text-gold"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/about" onClick={() => setOpen(false)} className="text-base tracking-[0.32em] uppercase text-cream/85 hover:text-gold">
              {t.nav.about}
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="text-base tracking-[0.32em] uppercase text-cream/85 hover:text-gold">
              {t.nav.contact}
            </Link>
            <div className="mt-6 pt-8 border-t border-cream/10 w-full max-w-xs flex items-center justify-center gap-8">
              <LanguageSwitcher />
              <span className="h-3 w-px bg-cream/20" />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
