import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import logo from "@/assets/obrent-logo-header.png";

export function SiteHeader() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/" as const, label: t.nav.home },
    { to: "/fleet" as const, label: t.nav.fleet },
    { to: "/about" as const, label: t.nav.about },
    { to: "/contact" as const, label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold transition-colors duration-300 relative"
              activeProps={{ className: "text-gold" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <LanguageSwitcher />
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
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.28em] uppercase text-cream/80 hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
