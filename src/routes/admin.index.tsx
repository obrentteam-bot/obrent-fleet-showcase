import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logo from "@/assets/obrent-logo.png";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Concierge-Zugang — OBRENT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/admin/dashboard" }), 600);
  };

  return (
    <div className="min-h-screen flex bg-onyx">
      {/* Left visual */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-onyx/70" />
        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          <Link to="/" className="font-display text-2xl tracking-[0.18em] text-cream">
            OB<span className="text-gold">RENT</span>
          </Link>
          <div>
            <div className="eyebrow mb-4">{t.nav.concierge}</div>
            <h2 className="font-display text-5xl text-cream leading-tight">
              {t.admin.curtain} <span className="italic text-gold/90 font-light">{t.admin.curtainItalic}</span>.
            </h2>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-20 py-16 relative">
        <div className="absolute top-6 right-8">
          <LanguageSwitcher />
        </div>
        <Link to="/" className="lg:hidden font-display text-2xl tracking-[0.18em] text-cream mb-12">
          OB<span className="text-gold">RENT</span>
        </Link>
        <div className="max-w-md w-full">
          <div className="flex items-center gap-4 mb-6">
            <span className="gold-rule" />
            <span className="eyebrow">{t.admin.eyebrow}</span>
          </div>
          <h1 className="font-display text-5xl text-cream mb-4">{t.admin.signIn}</h1>
          <p className="text-cream/55 font-light mb-12">
            {t.admin.lead}
          </p>

          <form onSubmit={onSubmit} className="space-y-8">
            <div>
              <label className="lux-label">{t.admin.email}</label>
              <input className="lux-input" type="email" placeholder="agent@obrent.com" required />
            </div>
            <div>
              <label className="lux-label">{t.admin.passphrase}</label>
              <input className="lux-input" type="password" placeholder="••••••••••" required />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-cream/55">
                <input type="checkbox" className="accent-gold" /> {t.admin.remember}
              </label>
              <a href="#" className="text-gold/80 hover:text-gold tracking-[0.2em] uppercase">{t.admin.recover}</a>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
              {loading ? t.admin.authenticating : t.admin.enter}
            </button>
          </form>

          <p className="mt-10 text-xs text-cream/35">
            {t.admin.monitored}
          </p>
        </div>
      </div>
    </div>
  );
}
