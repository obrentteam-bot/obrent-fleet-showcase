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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" role="img" aria-hidden="true" className="h-6 w-6">
                <defs>
                  <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDCB5C" />
                    <stop offset="0.35" stopColor="#F7743B" />
                    <stop offset="0.7" stopColor="#D62976" />
                    <stop offset="1" stopColor="#7638FA" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
                <circle cx="12" cy="12" r="4.6" fill="none" stroke="white" strokeWidth="1.7" />
                <circle cx="17.4" cy="6.7" r="1.2" fill="white" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
