import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
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
  const { session, isAdmin, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && session && isAdmin) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [session, isAdmin, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr || !data.session) {
      setLoading(false);
      setError(signErr?.message ?? "Login fehlgeschlagen");
      return;
    }
    // verify role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setLoading(false);
    if (!roleRow) {
      await supabase.auth.signOut();
      setError("Kein Admin-Zugriff für diesen Account.");
      return;
    }
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <div className="min-h-screen flex bg-onyx">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-onyx/70" />
        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          <Link to="/" aria-label="OBRENT">
            <img src={logo} alt="OBRENT — Luxus Autovermietung" className="h-16 w-auto" />
          </Link>
          <div>
            <div className="eyebrow mb-4">{t.nav.concierge}</div>
            <h2 className="font-display text-5xl text-cream leading-tight">
              {t.admin.curtain} <span className="italic text-gold/90 font-light">{t.admin.curtainItalic}</span>.
            </h2>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-20 py-16 relative">
        <div className="absolute top-6 right-8">
          <LanguageSwitcher />
        </div>
        <Link to="/" className="lg:hidden mb-12" aria-label="OBRENT">
          <img src={logo} alt="OBRENT — Luxus Autovermietung" className="h-14 w-auto" />
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
              <input className="lux-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@obrent.com" />
            </div>
            <div>
              <label className="lux-label">{t.admin.passphrase}</label>
              <input className="lux-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" />
            </div>
            {error && <div className="text-sm text-red-400/90">{error}</div>}
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
