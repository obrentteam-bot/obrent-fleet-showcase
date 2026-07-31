import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/useSettings";
import { FEATURES } from "@/lib/features";
import logo from "@/assets/obrent-logo.webp";


export function SiteFooter() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  const addressLines = settings.address.split(",").map((s) => s.trim());
  return (
    <footer className="text-cream relative" style={{ ["--cream" as any]: "oklch(0.93 0.015 80)", ["--color-cream" as any]: "oklch(0.93 0.015 80)", ["--foreground" as any]: "oklch(0.93 0.015 80)" }}>
      <div className="bg-[linear-gradient(180deg,oklch(0.10_0_0)_0%,oklch(0.55_0.005_80)_50%,oklch(0.10_0_0)_100%)] border-t border-cream/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <img src={logo} loading="lazy" decoding="async" alt="OBRENT — Luxus Autovermietung" className="h-28 md:h-56 w-auto mb-6 -ml-3" />
            <p className="text-sm text-cream/55 leading-relaxed font-light">
              {t.footer.slogan}
            </p>
          </div>

          <div>
            <div className="eyebrow text-cream/50 mb-6">{t.footer.navigate}</div>
            <ul className="space-y-3 text-sm text-cream/70 font-light">
              <li><Link to="/" className="hover:text-gold transition-colors">{t.nav.home}</Link></li>
              <li><Link to="/fleet" className="hover:text-gold transition-colors">{t.nav.fleet}</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">{t.nav.about}</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">{t.nav.contact}</Link></li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-cream/50 mb-6">{t.footer.atelier}</div>
            <ul className="space-y-3 text-sm text-cream/70 font-light">
              {addressLines.map((l, i) => <li key={i}>{l}</li>)}
              <li><a href={`mailto:${settings.email}`} className="hover:text-gold transition-colors">{settings.email}</a></li>
              <li><a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-gold transition-colors">{settings.phone}</a></li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-cream/50 mb-6">{t.footer.hours}</div>
            <ul className="space-y-3 text-sm text-cream/70 font-light">
              {settings.hours.split("\n").map((l, i) => <li key={i}>{l}</li>)}
              {FEATURES.chauffeurService && (
                <li className="pt-3 text-xs text-cream/40">{t.footer.chauffeur}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs tracking-[0.2em] uppercase text-cream/40">
            {t.footer.rights.replace("{year}", String(year))}
          </div>
          <div className="flex items-center gap-8">
            <div className="flex gap-8 text-xs tracking-[0.2em] uppercase text-cream/40">
              <Link to="/datenschutz" className="hover:text-gold transition-colors">{t.footer.privacy}</Link>
              <Link to="/impressum" className="hover:text-gold transition-colors">{t.footer.imprint}</Link>
            </div>
            <a
              href="https://instagram.com/obrent.de"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-300"
            >
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none" role="img" aria-hidden="true" className="h-[26px] w-[26px]">
                <defs>
                  <radialGradient id="ig-grad" cx="28%" cy="100%" r="130%">
                    <stop offset="0%" stopColor="#FFB03A" />
                    <stop offset="22%" stopColor="#F7802F" />
                    <stop offset="45%" stopColor="#EE5C52" />
                    <stop offset="62%" stopColor="#E0417E" />
                    <stop offset="80%" stopColor="#C32BA0" />
                    <stop offset="100%" stopColor="#7B2FBE" />
                  </radialGradient>
                </defs>
                <path
                  fill="url(#ig-grad)"
                  d="M31 2h38c16 0 29 13 29 29v38c0 16-13 29-29 29H31C15 98 2 85 2 69V31C2 15 15 2 31 2Z"
                />
                <path
                  fill="#fff"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M50 16c-9.2 0-10.4 0-14 .2-3.6.2-6.1.7-8.2 1.6-2.3.9-4.2 2-6.1 3.9-1.9 1.9-3 3.8-3.9 6.1-.9 2.1-1.4 4.6-1.6 8.2-.2 3.6-.2 4.8-.2 14s0 10.4.2 14c.2 3.6.7 6.1 1.6 8.2.9 2.3 2 4.2 3.9 6.1 1.9 1.9 3.8 3 6.1 3.9 2.1.9 4.6 1.4 8.2 1.6 3.6.2 4.8.2 14 .2s10.4 0 14-.2c3.6-.2 6.1-.7 8.2-1.6 2.3-.9 4.2-2 6.1-3.9 1.9-1.9 3-3.8 3.9-6.1.9-2.1 1.4-4.6 1.6-8.2.2-3.6.2-4.8.2-14s0-10.4-.2-14c-.2-3.6-.7-6.1-1.6-8.2-.9-2.3-2-4.2-3.9-6.1-1.9-1.9-3.8-3-6.1-3.9-2.1-.9-4.6-1.4-8.2-1.6-3.6-.2-4.8-.2-14-.2Zm0 6.1c9 0 10.1 0 13.7.2 3.3.2 5.1.7 6.3 1.2 1.6.6 2.7 1.3 3.9 2.5 1.2 1.2 1.9 2.3 2.5 3.9.5 1.2 1 3 1.2 6.3.2 3.6.2 4.7.2 13.8 0 9-.1 10.1-.2 13.7-.2 3.3-.7 5.1-1.2 6.3-.6 1.6-1.3 2.7-2.5 3.9-1.2 1.2-2.3 1.9-3.9 2.5-1.2.5-3 1-6.3 1.2-3.6.2-4.7.2-13.7.2s-10.1 0-13.7-.2c-3.3-.2-5.1-.7-6.3-1.2-1.6-.6-2.7-1.3-3.9-2.5-1.2-1.2-1.9-2.3-2.5-3.9-.5-1.2-1-3-1.2-6.3-.2-3.6-.2-4.7-.2-13.7s0-10.2.2-13.8c.2-3.3.7-5.1 1.2-6.3.6-1.6 1.3-2.7 2.5-3.9 1.2-1.2 2.3-1.9 3.9-2.5 1.2-.5 3-1 6.3-1.2 3.6-.2 4.7-.2 13.7-.2Zm0 10.4c-9.4 0-17 7.6-17 17.1 0 9.4 7.6 17 17 17s17-7.6 17-17c0-9.5-7.6-17.1-17-17.1Zm0 28.2c-6.1 0-11.1-5-11.1-11.1 0-6.2 5-11.2 11.1-11.2s11.1 5 11.1 11.2c0 6.1-5 11.1-11.1 11.1Zm21.7-28.9c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4Z"
                />
              </svg>

            </a>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
