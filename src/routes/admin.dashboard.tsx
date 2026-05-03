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

const CATEGORIES = ["SUV", "Limousine", "Kombi", "Sports"] as const;

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

type VehicleForm = {
  name: string;
  category: string;
  description: string;
  engine: string;
  power_ps: string;
  year: string;
  color: string;
  price_per_day: string;
  images: string[];
  available: boolean;
};

const emptyForm: VehicleForm = {
  name: "",
  category: "SUV",
  description: "",
  engine: "",
  power_ps: "",
  year: String(new Date().getFullYear()),
  color: "",
  price_per_day: "",
  images: [""],
  available: true,
};

function VehicleModal({
  initial,
  editingId,
  onClose,
  onSaved,
}: {
  initial: VehicleForm;
  editingId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<VehicleForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof VehicleForm>(k: K, v: VehicleForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const updateImage = (i: number, val: string) =>
    setForm((f) => ({ ...f, images: f.images.map((x, idx) => (idx === i ? val : x)) }));
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ""] }));
  const removeImage = (i: number) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setError(null);
    if (!form.name.trim() || !form.price_per_day) {
      setError("Name und Preis sind erforderlich.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim() || null,
      engine: form.engine.trim() || null,
      power_ps: form.power_ps ? Number(form.power_ps) : null,
      year: form.year ? Number(form.year) : null,
      color: form.color.trim() || null,
      price_per_day: Number(form.price_per_day),
      images: form.images.map((s) => s.trim()).filter(Boolean),
      available: form.available,
    };
    const res = editingId
      ? await supabase.from("vehicles").update(payload).eq("id", editingId)
      : await supabase.from("vehicles").insert(payload);
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-jet border border-border max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-2xl text-cream">{editingId ? "Fahrzeug bearbeiten" : "Fahrzeug hinzufügen"}</h2>
          <button onClick={onClose} className="text-cream/50 hover:text-gold text-xl">×</button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Name">
            <input className="lux-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Kategorie">
            <select className="lux-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Beschreibung">
            <textarea className="lux-input min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Motor"><input className="lux-input" value={form.engine} onChange={(e) => set("engine", e.target.value)} /></Field>
            <Field label="PS"><input type="number" className="lux-input" value={form.power_ps} onChange={(e) => set("power_ps", e.target.value)} /></Field>
            <Field label="Baujahr"><input type="number" className="lux-input" value={form.year} onChange={(e) => set("year", e.target.value)} /></Field>
            <Field label="Farbe"><input className="lux-input" value={form.color} onChange={(e) => set("color", e.target.value)} /></Field>
            <Field label="Preis pro Tag (€)"><input type="number" className="lux-input" value={form.price_per_day} onChange={(e) => set("price_per_day", e.target.value)} /></Field>
            <Field label="Verfügbar">
              <button type="button" onClick={() => set("available", !form.available)} className={`px-4 py-3 text-[0.65rem] tracking-[0.22em] uppercase border w-full ${form.available ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                {form.available ? "Ja" : "Nein"}
              </button>
            </Field>
          </div>
          <div>
            <label className="lux-label">Bilder (URL) — erste = Hauptbild</label>
            <div className="space-y-2">
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input className="lux-input flex-1" placeholder="https://…" value={img} onChange={(e) => updateImage(i, e.target.value)} />
                  {form.images.length > 1 && (
                    <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-gold px-3 border border-border">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addImage} className="text-[0.65rem] tracking-[0.22em] uppercase text-gold hover:text-cream">+ Bild hinzufügen</button>
            </div>
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <button onClick={onClose} className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/60 hover:text-cream px-5 py-3 border border-border">Abbrechen</button>
          <button onClick={save} disabled={saving} className="btn-gold text-[0.65rem] py-3 px-6 disabled:opacity-60">{saving ? "Speichert…" : "Speichern"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="lux-label">{label}</label>
      {children}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-jet border border-border max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-cream mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/60 hover:text-cream px-5 py-3 border border-border">Abbrechen</button>
          <button onClick={onConfirm} className="text-[0.65rem] tracking-[0.28em] uppercase text-white bg-red-500/80 hover:bg-red-500 px-5 py-3">Löschen</button>
        </div>
      </div>
    </div>
  );
}

function vehicleToForm(v: DbVehicle): VehicleForm {
  return {
    name: v.name ?? "",
    category: v.category ?? "SUV",
    description: v.description ?? "",
    engine: v.engine ?? "",
    power_ps: v.power_ps != null ? String(v.power_ps) : "",
    year: v.year != null ? String(v.year) : "",
    color: v.color ?? "",
    price_per_day: String(v.price_per_day ?? ""),
    images: v.images && v.images.length ? v.images : [""],
    available: v.available ?? true,
  };
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState<"bookings" | "vehicles">("bookings");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DbVehicle | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: "vehicle" | "booking"; id: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/admin" });
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

  useEffect(() => { if (session && isAdmin) load(); }, [session, isAdmin, load]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) setBookings((p) => p.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const toggleAvailable = async (v: DbVehicle) => {
    const next = !v.available;
    const { error } = await supabase.from("vehicles").update({ available: next }).eq("id", v.id);
    if (!error) setVehicles((p) => p.map((x) => (x.id === v.id ? { ...x, available: next } : x)));
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const { kind, id } = confirmDelete;
    setConfirmDelete(null);
    if (kind === "vehicle") {
      await supabase.from("vehicles").delete().eq("id", id);
    } else {
      await supabase.from("bookings").delete().eq("id", id);
    }
    load();
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/admin" }); };

  if (authLoading) {
    return <div className="min-h-screen bg-onyx flex items-center justify-center text-cream/50 text-xs tracking-[0.3em] uppercase">Lade…</div>;
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
  const counts = {
    pending: bookings.filter((b) => (b.status ?? "pending") === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };
  const filteredBookings = statusFilter === "all" ? bookings : bookings.filter((b) => (b.status ?? "pending") === statusFilter);

  return (
    <div className="min-h-screen bg-onyx text-cream">
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
          <button onClick={signOut} className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold border border-border px-4 py-2">Abmelden</button>
        </div>
      </header>

      <div className="px-6 md:px-12 pt-8 flex gap-8 border-b border-border">
        {(["bookings", "vehicles"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`pb-3 text-[0.7rem] tracking-[0.28em] uppercase border-b-2 transition ${tab === k ? "border-gold text-gold" : "border-transparent text-cream/55 hover:text-cream"}`}>
            {k === "bookings" ? `Buchungen (${bookings.length})` : `Fahrzeuge (${vehicles.length})`}
          </button>
        ))}
        <button onClick={load} className="ml-auto pb-3 text-[0.7rem] tracking-[0.28em] uppercase text-cream/55 hover:text-gold">↻ Aktualisieren</button>
      </div>

      <main className="px-6 md:px-12 py-8">
        {loadingData ? (
          <div className="text-center py-20 text-cream/40 text-xs tracking-[0.3em] uppercase">Lade…</div>
        ) : tab === "bookings" ? (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="text-sm text-cream/70 tracking-wide">
                <span className="text-yellow-400">{counts.pending} Offen</span>
                <span className="text-cream/30 mx-2">·</span>
                <span className="text-green-400">{counts.confirmed} Bestätigt</span>
                <span className="text-cream/30 mx-2">·</span>
                <span className="text-red-400">{counts.rejected} Abgelehnt</span>
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")} className="lux-input !py-2 !w-auto">
                <option value="all">Alle</option>
                <option value="pending">Offen</option>
                <option value="confirmed">Bestätigt</option>
                <option value="rejected">Abgelehnt</option>
              </select>
            </div>
            <section className="bg-jet border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[1200px]">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Datum", "Name", "E-Mail", "Telefon", "Fahrzeug", "Zeitraum", "Nachricht", "Status", "Aktionen"].map((h) => (
                      <th key={h} className="px-4 py-4 text-[0.6rem] tracking-[0.24em] uppercase text-cream/45 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-cream/40">Keine Buchungen</td></tr>
                  )}
                  {filteredBookings.map((b) => {
                    const status = (b.status ?? "pending") as Status;
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
                            <button onClick={() => setConfirmDelete({ kind: "booking", id: b.id })} className="text-[0.6rem] tracking-[0.22em] uppercase text-cream/50 hover:text-red-400 text-left">Löschen</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="text-sm text-cream/60">{vehicles.length} Fahrzeuge insgesamt</div>
              <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-gold text-[0.65rem] py-3 px-6">+ Fahrzeug hinzufügen</button>
            </div>
            <section className="bg-jet border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Name", "Kategorie", "Preis / Tag", "Verfügbar", "Aktionen"].map((h) => (
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
                        <button onClick={() => toggleAvailable(v)} className={`inline-block px-2.5 py-1 text-[0.6rem] tracking-[0.22em] uppercase border ${v.available ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                          {v.available ? "Ja" : "Nein"}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-3">
                          <button onClick={() => { setEditing(v); setModalOpen(true); }} className="text-[0.6rem] tracking-[0.22em] uppercase text-gold hover:text-cream">Bearbeiten</button>
                          <button onClick={() => setConfirmDelete({ kind: "vehicle", id: v.id })} className="text-[0.6rem] tracking-[0.22em] uppercase text-red-400 hover:text-cream">Löschen</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>

      {modalOpen && (
        <VehicleModal
          initial={editing ? vehicleToForm(editing) : emptyForm}
          editingId={editing?.id ?? null}
          onClose={() => setModalOpen(false)}
          onSaved={load}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={confirmDelete.kind === "vehicle" ? "Fahrzeug wirklich löschen?" : "Buchung wirklich löschen?"}
          onConfirm={doDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
