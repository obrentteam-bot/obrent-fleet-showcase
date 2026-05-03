import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/obrent-logo.png";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="text-cream relative">
      <div className="bg-[radial-gradient(ellipse_at_top,oklch(0.22_0.005_80)_0%,oklch(0.14_0.003_80)_55%,oklch(0.10_0_0)_100%)] border-t border-cream/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <img src={logo} alt="OBRENT — Luxus Autovermietung" className="h-36 md:h-44 w-auto mb-6 -ml-3" />
            <p className="text-sm text-onyx/65 leading-relaxed font-light">
              {t.footer.slogan}
            </p>
          </div>

          <div>
            <div className="eyebrow text-onyx/60 mb-6">{t.footer.navigate}</div>
            <ul className="space-y-3 text-sm text-onyx/75 font-light">
              <li><Link to="/" className="hover:text-gold transition-colors">{t.nav.home}</Link></li>
              <li><Link to="/fleet" className="hover:text-gold transition-colors">{t.nav.fleet}</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">{t.nav.about}</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">{t.nav.contact}</Link></li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-onyx/60 mb-6">{t.footer.atelier}</div>
            <ul className="space-y-3 text-sm text-onyx/75 font-light">
              <li>Monaco · Paris · Dubai</li>
              <li>{t.footer.byAppointment}</li>
              <li>concierge@obrent.com</li>
              <li>+377 9777 0000</li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-onyx/60 mb-6">{t.footer.hours}</div>
            <ul className="space-y-3 text-sm text-onyx/75 font-light">
              <li>{t.footer.hoursDays}</li>
              <li>{t.footer.hours24}</li>
              <li className="pt-3 text-xs text-onyx/50">{t.footer.chauffeur}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-onyx/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs tracking-[0.2em] uppercase text-onyx/50">
            {t.footer.rights.replace("{year}", String(year))}
          </div>
          <div className="flex gap-8 text-xs tracking-[0.2em] uppercase text-onyx/50">
            <a href="#" className="hover:text-gold transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-gold transition-colors">{t.footer.terms}</a>
            <a href="#" className="hover:text-gold transition-colors">{t.footer.imprint}</a>
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
