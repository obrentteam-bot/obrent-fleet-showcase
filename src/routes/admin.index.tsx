import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Concierge Access — OBRENT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // UI only — proceed to dashboard
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
            <div className="eyebrow mb-4">Concierge</div>
            <h2 className="font-display text-5xl text-cream leading-tight">
              The atelier, <span className="italic text-gold/90 font-light">behind the curtain</span>.
            </h2>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-20 py-16">
        <Link to="/" className="lg:hidden font-display text-2xl tracking-[0.18em] text-cream mb-12">
          OB<span className="text-gold">RENT</span>
        </Link>
        <div className="max-w-md w-full">
          <div className="flex items-center gap-4 mb-6">
            <span className="gold-rule" />
            <span className="eyebrow">Restricted Access</span>
          </div>
          <h1 className="font-display text-5xl text-cream mb-4">Concierge Sign-In</h1>
          <p className="text-cream/55 font-light mb-12">
            For OBRENT staff and authorised concierge agents only.
          </p>

          <form onSubmit={onSubmit} className="space-y-8">
            <div>
              <label className="lux-label">Email</label>
              <input className="lux-input" type="email" placeholder="agent@obrent.com" required />
            </div>
            <div>
              <label className="lux-label">Passphrase</label>
              <input className="lux-input" type="password" placeholder="••••••••••" required />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-cream/55">
                <input type="checkbox" className="accent-gold" /> Remember device
              </label>
              <a href="#" className="text-gold/80 hover:text-gold tracking-[0.2em] uppercase">Recover</a>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
              {loading ? "Authenticating…" : "Enter Atelier"}
            </button>
          </form>

          <p className="mt-10 text-xs text-cream/35">
            Unauthorised access is monitored and logged. By signing in you acknowledge OBRENT's internal data handling policy.
          </p>
        </div>
      </div>
    </div>
  );
}
