import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-onyx border-t border-border">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="font-display text-2xl tracking-[0.18em] text-cream mb-6">
              OB<span className="text-gold">RENT</span>
            </div>
            <p className="text-sm text-cream/55 leading-relaxed font-light">
              Curated motoring. Discreet service. An invitation to the extraordinary.
            </p>
          </div>

          <div>
            <div className="eyebrow mb-6">Navigate</div>
            <ul className="space-y-3 text-sm text-cream/70 font-light">
              <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
              <li><Link to="/fleet" className="hover:text-gold transition-colors">Fleet</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="eyebrow mb-6">Atelier</div>
            <ul className="space-y-3 text-sm text-cream/70 font-light">
              <li>Monaco · Paris · Dubai</li>
              <li>By appointment only</li>
              <li>concierge@obrent.com</li>
              <li>+377 9777 0000</li>
            </ul>
          </div>

          <div>
            <div className="eyebrow mb-6">Hours</div>
            <ul className="space-y-3 text-sm text-cream/70 font-light">
              <li>Monday — Sunday</li>
              <li>24 hours · By request</li>
              <li className="pt-3 text-xs text-cream/40">Private chauffeur available</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs tracking-[0.2em] uppercase text-cream/40">
            © {new Date().getFullYear()} OBRENT · All Rights Reserved
          </div>
          <div className="flex gap-8 text-xs tracking-[0.2em] uppercase text-cream/40">
            <a href="#" className="hover:text-gold transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms</a>
            <a href="#" className="hover:text-gold transition-colors">Imprint</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
