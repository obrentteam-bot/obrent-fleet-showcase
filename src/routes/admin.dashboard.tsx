import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/vehicles";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { supabase, type DbBooking } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import logo from "@/assets/obrent-logo.png";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — OBRENT Concierge" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Status = "pending" | "confirmed" | "rejected";

type BookingRow = DbBooking & { vehicles?: { name: string } | null };

function StatusBadge({ s, label }: { s: Status; label: string }) {
  const map: Record<Status, { bg: string; dot: string; text: string }> = {
    pending: { bg: "bg-status-pending/10", dot: "bg-status-pending", text: "text-status-pending" },
    confirmed: { bg: "bg-status-confirmed/10", dot: "bg-status-confirmed", text: "text-status-confirmed" },
    rejected: { bg: "bg-status-rejected/10", dot: "bg-status-rejected", text: "text-status-rejected" },
  };
  const c = map[s];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 ${c.bg} ${c.text} border border-current/20`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className="text-[0.65rem] tracking-[0.22em] uppercase font-medium">{label}</span>
    </span>
  );
}

function AdminDashboard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!session || !isAdmin)) {
      navigate({ to: "/admin" });
    }
  }, [session, isAdmin, authLoading, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("*, vehicles(name)")
      .order("created_at", { ascending: false });
    setBookings((data ?? []) as BookingRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session && isAdmin) load();
  }, [session, isAdmin, load]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => (b.status ?? "pending") === filter);

  const filterLabels: Record<Status | "all", string> = {
    all: t.admin.status.all,
    pending: t.admin.status.pending,
    confirmed: t.admin.status.confirmed,
    rejected: t.admin.status.rejected,
  };

  const sidebar = [
    { label: t.admin.sidebar.reservations, active: true },
    { label: t.admin.sidebar.fleet },
    { label: t.admin.sidebar.clients },
    { label: t.admin.sidebar.calendar },
    { label: t.admin.sidebar.reports },
    { label: t.admin.sidebar.settings },
  ];

  const stats = [
    { label: t.admin.stats.active, value: String(bookings.filter((b) => b.status === "confirmed").length) },
    { label: t.admin.stats.pending, value: String(bookings.filter((b) => (b.status ?? "pending") === "pending").length) },
    { label: t.admin.stats.revenue, value: formatPrice(0) },
    { label: t.admin.stats.utilisation, value: `${bookings.length}` },
  ];

  if (authLoading || !session || !isAdmin) {
    return <div className="min-h-screen bg-onyx flex items-center justify-center text-cream/50">…</div>;
  }

  return (
    <div className="min-h-screen bg-onyx flex">
      <aside className="hidden lg:flex w-64 shrink-0 bg-jet border-r border-border flex-col">
        <div className="p-8 border-b border-border">
          <Link to="/" aria-label="OBRENT">
            <img src={logo} alt="OBRENT — Luxus Autovermietung" className="h-12 w-auto" />
          </Link>
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/70 mt-1">{t.nav.concierge}</div>
        </div>
        <nav className="flex-1 p-6 space-y-1">
          {sidebar.map((i) => (
            <a
              key={i.label}
              href="#"
              className={`block px-4 py-3 text-xs tracking-[0.24em] uppercase transition ${
                i.active ? "bg-gold/10 text-gold border-l-2 border-gold" : "text-cream/55 hover:text-cream border-l-2 border-transparent"
              }`}
            >
              {i.label}
            </a>
          ))}
        </nav>
        <div className="p-6 border-t border-border flex items-center justify-between gap-4">
          <button onClick={signOut} className="text-xs tracking-[0.24em] uppercase text-cream/45 hover:text-gold">
            {t.admin.sidebar.signOut}
          </button>
          <LanguageSwitcher />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-6 md:px-12 py-6 flex items-center justify-between">
          <div>
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-cream/40 mb-1">{session.user.email}</div>
            <h1 className="font-display text-3xl text-cream">{t.admin.reservations}</h1>
          </div>
          <button onClick={load} className="btn-ghost text-[0.65rem] py-3 px-5">↻</button>
        </header>

        <div className="p-6 md:p-12 space-y-10">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {stats.map((s) => (
              <div key={s.label} className="bg-jet p-8">
                <div className="text-[0.6rem] tracking-[0.3em] uppercase text-cream/45 mb-3">{s.label}</div>
                <div className="font-display text-4xl text-cream">{s.value}</div>
              </div>
            ))}
          </section>

          <section className="flex items-center gap-2 md:gap-6 border-b border-border pb-4 overflow-x-auto">
            {(["all", "pending", "confirmed", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[0.65rem] tracking-[0.28em] uppercase px-1 py-2 border-b transition ${
                  filter === f ? "text-gold border-gold" : "text-cream/55 border-transparent hover:text-cream"
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
            <span className="ml-auto text-[0.65rem] tracking-[0.28em] uppercase text-cream/40">{filtered.length} {t.admin.table.entries}</span>
          </section>

          <section className="bg-jet border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  {[t.admin.table.reference, t.admin.table.client, t.admin.table.vehicle, "Email", t.admin.table.dates, t.admin.table.status, "Aktionen"].map((h, i) => (
                    <th key={i} className="text-left px-6 py-5 text-[0.6rem] tracking-[0.28em] uppercase text-cream/45 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-cream/50">…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-cream/40">Keine Buchungen</td></tr>
                )}
                {filtered.map((b) => {
                  const status = (b.status ?? "pending") as Status;
                  return (
                    <tr key={b.id} className="border-b border-border/60 hover:bg-onyx/40 transition align-top">
                      <td className="px-6 py-5 font-mono text-xs text-gold/90 tracking-wider">{b.id.slice(0, 8)}</td>
                      <td className="px-6 py-5 text-cream">
                        {b.customer_name}
                        <div className="text-xs text-cream/40 mt-1">{b.phone}</div>
                      </td>
                      <td className="px-6 py-5 text-cream/80">{b.vehicles?.name ?? "—"}</td>
                      <td className="px-6 py-5 text-cream/60 text-xs">{b.email}</td>
                      <td className="px-6 py-5 text-cream/60">{b.start_date} — {b.end_date}</td>
                      <td className="px-6 py-5"><StatusBadge s={status} label={filterLabels[status]} /></td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <button onClick={() => updateStatus(b.id, "confirmed")} disabled={status === "confirmed"} className="text-[0.6rem] tracking-[0.24em] uppercase text-status-confirmed hover:text-gold disabled:opacity-30">Bestätigen</button>
                          <button onClick={() => updateStatus(b.id, "rejected")} disabled={status === "rejected"} className="text-[0.6rem] tracking-[0.24em] uppercase text-status-rejected hover:text-gold disabled:opacity-30">Ablehnen</button>
                          <button onClick={() => updateStatus(b.id, "pending")} disabled={status === "pending"} className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/55 hover:text-gold disabled:opacity-30">Offen</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {filtered.map((b) => b.message && (
            <details key={`msg-${b.id}`} className="text-xs text-cream/50 bg-jet/40 px-4 py-2 border border-border">
              <summary className="cursor-pointer">Details — {b.customer_name}</summary>
              <pre className="whitespace-pre-wrap mt-2 text-cream/70">{b.message}</pre>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
