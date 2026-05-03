import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase, type DbBooking, type DbVehicle, formatPrice } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import logo from "@/assets/obrent-logo.png";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — OBRENT" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Status = "pending" | "confirmed" | "rejected";
type BookingRow = DbBooking & { phone?: string | null; vehicles?: { name: string } | null };

const STATUS_LABEL: Record<Status, string> = {
  pending: "Offen",
  confirmed: "Bestätigt",
  rejected: "Abgelehnt",
};

function StatusBadge({ s }: { s: Status }) {
  const cls: Record<Status, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return (
    <span className={`inline-block px-2.5 py-1 text-[0.65rem] tracking-[0.2em] uppercase border ${cls[s]}`}>
      {STATUS_LABEL[s]}
    </span>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState<"bookings" | "vehicles">("bookings");

  useEffect(() => {
    if (!authLoading && !session) {
      navigate({ to: "/admin" });
    }
  }, [session, authLoading, navigate]);

  const load = useCallback(async () => {
    setLoadingData(true);
    const [b, v] = await Promise.all([
      supabase.from("bookings").select("*, vehicles(name)").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("*").order("name"),
    ]);
    setBookings((b.data ?? []) as BookingRow[]);
    setVehicles((v.data ?? []) as DbVehicle[]);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (session && isAdmin) load();
  }, [session, isAdmin, load]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) setBookings((p) => p.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const toggleAvailable = async (v: DbVehicle) => {
    const next = !v.available;
    const { error } = await supabase.from("vehicles").update({ available: next }).eq("id", v.id);
    if (!error) setVehicles((p) => p.map((x) => (x.id === v.id ? { ...x, available: next } : x)));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-onyx flex items-center justify-center text-cream/50 text-xs tracking-[0.3em] uppercase">
        Lade…
      </div>
    );
  }

  if (!session) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-onyx flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="text-[0.65rem] tracking-[0.3em] uppercase text-gold/70">OBRENT Admin</div>
        <h1 className="font-display text-4xl text-cream">Kein Zugriff</h1>
        <p className="text-cream/55 max-w-md">Dieser Account hat keine Admin-Rechte.</p>
        <button onClick={signOut} className="btn-ghost text-[0.65rem] py-3 px-6">Abmelden</button>
      </div>
    );
  }

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("de-DE") : "—");

  return (
    <div className="min-h-screen bg-onyx text-cream">
      {/* Header */}
      <header className="border-b border-border px-6 md:px-12 py-5 flex items-center justify-between gap-6 flex-wrap">
        <Link to="/" className="flex items-center gap-4">
          <img src={logo} alt="OBRENT" className="h-10 w-auto" />
          <div>
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/70">OBRENT</div>
            <div className="font-display text-xl">Admin</div>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <div className="text-xs text-cream/60 hidden md:block">{session.user.email}</div>
          <button onClick={signOut} className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold border border-border px-4 py-2">
            Abmelden
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-6 md:px-12 pt-8 flex gap-8 border-b border-border">
        {(["bookings", "vehicles"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`pb-3 text-[0.7rem] tracking-[0.28em] uppercase border-b-2 transition ${
              tab === k ? "border-gold text-gold" : "border-transparent text-cream/55 hover:text-cream"
            }`}
          >
            {k === "bookings" ? `Buchungen (${bookings.length})` : `Fahrzeuge (${vehicles.length})`}
          </button>
        ))}
        <button onClick={load} className="ml-auto pb-3 text-[0.7rem] tracking-[0.28em] uppercase text-cream/55 hover:text-gold">
          ↻ Aktualisieren
        </button>
      </div>

      <main className="px-6 md:px-12 py-8">
        {loadingData ? (
          <div className="text-center py-20 text-cream/40 text-xs tracking-[0.3em] uppercase">Lade…</div>
        ) : tab === "bookings" ? (
          <section className="bg-jet border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Datum", "Name", "E-Mail", "Telefon", "Fahrzeug", "Zeitraum", "Nachricht", "Status", "Aktionen"].map((h) => (
                    <th key={h} className="px-4 py-4 text-[0.6rem] tracking-[0.24em] uppercase text-cream/45 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-cream/40">Keine Buchungen vorhanden</td></tr>
                )}
                {bookings.map((b) => {
                  const status = ((b.status ?? "pending") as Status);
                  return (
                    <tr key={b.id} className="border-b border-border/60 align-top hover:bg-onyx/40">
                      <td className="px-4 py-4 text-cream/70 whitespace-nowrap">{fmtDate(b.created_at)}</td>
                      <td className="px-4 py-4 text-cream">{b.customer_name}</td>
                      <td className="px-4 py-4 text-cream/70">{b.email}</td>
                      <td className="px-4 py-4 text-cream/70">{b.phone ?? "—"}</td>
                      <td className="px-4 py-4 text-cream/80">{b.vehicles?.name ?? "—"}</td>
                      <td className="px-4 py-4 text-cream/70 whitespace-nowrap">{fmtDate(b.start_date)} – {fmtDate(b.end_date)}</td>
                      <td className="px-4 py-4 text-cream/60 max-w-xs">
                        {b.message ? (
                          <details><summary className="cursor-pointer text-gold/70 text-xs">Anzeigen</summary>
                            <pre className="whitespace-pre-wrap text-xs mt-2 text-cream/70">{b.message}</pre>
                          </details>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-4"><StatusBadge s={status} /></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => updateStatus(b.id, "confirmed")} disabled={status === "confirmed"} className="text-[0.6rem] tracking-[0.22em] uppercase text-green-400 hover:text-gold disabled:opacity-30 text-left">Bestätigen</button>
                          <button onClick={() => updateStatus(b.id, "rejected")} disabled={status === "rejected"} className="text-[0.6rem] tracking-[0.22em] uppercase text-red-400 hover:text-gold disabled:opacity-30 text-left">Ablehnen</button>
                          {status !== "pending" && (
                            <button onClick={() => updateStatus(b.id, "pending")} className="text-[0.6rem] tracking-[0.22em] uppercase text-cream/50 hover:text-gold text-left">Zurücksetzen</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ) : (
          <section className="bg-jet border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Name", "Kategorie", "Preis / Tag", "Verfügbar", "Aktion"].map((h) => (
                    <th key={h} className="px-4 py-4 text-[0.6rem] tracking-[0.24em] uppercase text-cream/45 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehicles.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-cream/40">Keine Fahrzeuge</td></tr>
                )}
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-border/60 hover:bg-onyx/40">
                    <td className="px-4 py-4 text-cream">{v.name}</td>
                    <td className="px-4 py-4 text-cream/70">{v.category}</td>
                    <td className="px-4 py-4 text-cream/80">{formatPrice(Number(v.price_per_day))}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[0.6rem] tracking-[0.22em] uppercase border ${v.available ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                        {v.available ? "Ja" : "Nein"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleAvailable(v)} className="text-[0.6rem] tracking-[0.22em] uppercase text-gold hover:text-cream">
                        {v.available ? "Deaktivieren" : "Aktivieren"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
