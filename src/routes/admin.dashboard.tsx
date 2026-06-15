import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo, Fragment } from "react";
import { supabase, type DbBooking, type DbVehicle, formatPrice } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useSettings, saveSettings, type AppSettings } from "@/lib/useSettings";
import { useMaintenance, setMaintenance } from "@/lib/useMaintenance";
import logo from "@/assets/obrent-logo.webp";

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
type ServiceType = "shuttle" | "chauffeur" | "langzeitmiete" | "fahrzeug";
type BookingRow = DbBooking & {
  phone?: string | null;
  admin_note?: string | null;
  service_type?: ServiceType | string | null;
  details?: Record<string, unknown> | null;
  vehicles?: { name: string } | null;
};
type VehicleRow = DbVehicle & { sort_order?: number | null };

const STATUS_LABEL: Record<Status, string> = {
  pending: "Offen", confirmed: "Bestätigt", rejected: "Abgelehnt",
};
const SERVICE_LABEL: Record<ServiceType, string> = {
  shuttle: "Shuttle",
  chauffeur: "Chauffeur",
  langzeitmiete: "Langzeitmiete",
  fahrzeug: "Fahrzeug",
};
const CATEGORIES = ["SUV", "Limousine", "Kombi", "Sports"] as const;
const SESSION_MAX_MS = 8 * 60 * 60 * 1000; // 8h

function StatusBadge({ s }: { s: Status }) {
  const cls: Record<Status, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-green-500/10 text-green-400 border-green-500/30",
    rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return <span className={`inline-block px-2.5 py-1 text-[0.65rem] tracking-[0.2em] uppercase border ${cls[s]}`}>{STATUS_LABEL[s]}</span>;
}

function ServiceBadge({ s }: { s?: string | null }) {
  const key = (s ?? "fahrzeug") as ServiceType;
  const cls: Record<ServiceType, string> = {
    shuttle: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    chauffeur: "bg-gold/10 text-gold border-gold/40",
    langzeitmiete: "bg-green-500/10 text-green-400 border-green-500/30",
    fahrzeug: "bg-cream/10 text-cream/70 border-cream/20",
  };
  const label = SERVICE_LABEL[key] ?? String(s ?? "—");
  return <span className={`inline-block px-2.5 py-1 text-[0.6rem] tracking-[0.2em] uppercase border ${cls[key] ?? cls.fahrzeug}`}>{label}</span>;
}


type VehicleForm = {
  name: string; category: string; description: string; engine: string;
  power_ps: string; year: string; color: string; price_per_day: string;
  images: string[]; available: boolean;
};
const emptyForm: VehicleForm = {
  name: "", category: "SUV", description: "", engine: "",
  power_ps: "", year: String(new Date().getFullYear()), color: "",
  price_per_day: "", images: [""], available: true,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="lux-label">{label}</label>{children}</div>;
}

function VehicleModal({ initial, editingId, onClose, onSaved }: {
  initial: VehicleForm; editingId: string | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<VehicleForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof VehicleForm>(k: K, v: VehicleForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setError(null);
    if (!form.name.trim() || !form.price_per_day) { setError("Name und Preis sind erforderlich."); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(), category: form.category,
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
    if (res.error) { setError(res.error.message); return; }
    onSaved(); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-jet border border-border max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-2xl text-cream">{editingId ? "Fahrzeug bearbeiten" : "Fahrzeug hinzufügen"}</h2>
          <button onClick={onClose} className="text-cream/50 hover:text-gold text-xl">×</button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Name"><input className="lux-input" value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Kategorie">
            <select className="lux-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Beschreibung"><textarea className="lux-input min-h-[80px]" value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
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
                <div key={i} className="flex gap-2 items-center">
                  {img && <img src={img} loading="lazy" decoding="async" alt="" className="w-12 h-10 object-cover border border-border" />}
                  <input className="lux-input flex-1" placeholder="https://…" value={img} onChange={(e) => setForm((f) => ({ ...f, images: f.images.map((x, idx) => idx === i ? e.target.value : x) }))} />
                  {form.images.length > 1 && <button type="button" onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="text-red-400 hover:text-gold px-3 border border-border">×</button>}
                </div>
              ))}
              <button type="button" onClick={() => setForm((f) => ({ ...f, images: [...f.images, ""] }))} className="text-[0.65rem] tracking-[0.22em] uppercase text-gold hover:text-cream">+ Bild hinzufügen</button>
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
    name: v.name ?? "", category: v.category ?? "SUV",
    description: v.description ?? "", engine: v.engine ?? "",
    power_ps: v.power_ps != null ? String(v.power_ps) : "",
    year: v.year != null ? String(v.year) : "",
    color: v.color ?? "", price_per_day: String(v.price_per_day ?? ""),
    images: v.images && v.images.length ? v.images : [""],
    available: v.available ?? true,
  };
}

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadBookingsCsv(rows: BookingRow[]) {
  const headers = ["Datum", "Name", "E-Mail", "Telefon", "Fahrzeug", "Start", "Ende", "Status", "Nachricht", "Notiz"];
  const lines = [headers.join(",")];
  for (const b of rows) {
    lines.push([
      b.created_at ?? "", b.customer_name, b.email, b.phone ?? "",
      b.vehicles?.name ?? "", b.start_date, b.end_date,
      b.status ?? "pending", b.message ?? "", b.admin_note ?? "",
    ].map(csvEscape).join(","));
  }
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `buchungen-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseMessage(msg?: string | null): { fields: Array<{ label: string; value: string }>; freeText: string | null } {
  if (!msg) return { fields: [], freeText: null };
  const lines = msg.split("\n").map((l) => l.trim()).filter(Boolean);
  const fields: Array<{ label: string; value: string }> = [];
  let freeText: string | null = null;
  const knownLabels = ["Betreff", "Abholzeit", "Rückgabezeit", "Übergabe", "Chauffeur", "Lieferadresse"];
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) { freeText = (freeText ? freeText + "\n" : "") + line; continue; }
    const label = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (label === "Nachricht") { freeText = (freeText ? freeText + "\n" : "") + value; continue; }
    if (knownLabels.includes(label) || label.length < 30) fields.push({ label, value });
    else freeText = (freeText ? freeText + "\n" : "") + line;
  }
  return { fields, freeText };
}

function DetailRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-2.5 border-b border-border/40 last:border-0">
      <div className="text-[0.6rem] tracking-[0.24em] uppercase text-cream/45 pt-0.5">{label}</div>
      <div className={`text-sm text-cream/90 ${mono ? "font-mono" : ""}`}>{value || <span className="text-cream/30">—</span>}</div>
    </div>
  );
}

function BookingDetails({
  booking, note, onNoteChange, onSaveNote, savingNote, onUpdateStatus, onDelete, fmtDate, fmtDateTime,
}: {
  booking: BookingRow;
  note: string;
  onNoteChange: (v: string) => void;
  onSaveNote: () => void;
  savingNote: boolean;
  onUpdateStatus: (s: Status) => void;
  onDelete: () => void;
  fmtDate: (d?: string | null) => string;
  fmtDateTime: (d?: string | null) => string;
}) {
  const status = (booking.status ?? "pending") as Status;
  const { fields, freeText } = parseMessage(booking.message);
  const days = (() => {
    try {
      const d = Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86400000);
      return Math.max(1, d || 1);
    } catch { return null; }
  })();
  const copyMail = `mailto:${booking.email}?subject=${encodeURIComponent("Ihre OBRENT-Anfrage")}`;
  const copyTel = booking.phone ? `tel:${booking.phone.replace(/\s/g, "")}` : null;

  return (
    <div className="px-8 py-8 bg-gradient-to-b from-onyx/80 to-onyx/40 border-l-2 border-gold/40">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kunde */}
        <div className="bg-jet/60 border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-8 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-medium">01</span>
            <h3 className="text-[0.7rem] tracking-[0.28em] uppercase text-gold">Kunde</h3>
          </div>
          <DetailRow label="Name" value={booking.customer_name} />
          <DetailRow label="E-Mail" value={<a href={copyMail} className="text-gold hover:underline">{booking.email}</a>} />
          <DetailRow label="Telefon" value={copyTel ? <a href={copyTel} className="text-gold hover:underline">{booking.phone}</a> : "—"} />
          <DetailRow label="Anfrage am" value={fmtDateTime(booking.created_at)} />
          <DetailRow label="Buchungs-ID" value={booking.id.slice(0, 8) + "…"} mono />
        </div>

        {/* Buchung */}
        <div className="bg-jet/60 border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-8 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-medium">02</span>
            <h3 className="text-[0.7rem] tracking-[0.28em] uppercase text-gold">Buchung</h3>
          </div>
          <DetailRow label="Fahrzeug" value={booking.vehicles?.name ?? "—"} />
          <DetailRow label="Abholung" value={fmtDate(booking.start_date)} />
          <DetailRow label="Rückgabe" value={fmtDate(booking.end_date)} />
          <DetailRow label="Dauer" value={days ? `${days} Tag${days === 1 ? "" : "e"}` : "—"} />
          <DetailRow label="Status" value={<StatusBadge s={status} />} />
          {fields.map((f) => <DetailRow key={f.label} label={f.label} value={f.value} />)}
        </div>

        {/* Notiz + Aktionen */}
        <div className="space-y-5">
          <div className="bg-jet/60 border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-medium">03</span>
              <h3 className="text-[0.7rem] tracking-[0.28em] uppercase text-gold">Interne Notiz</h3>
            </div>
            <textarea
              className="lux-input min-h-[110px] mb-3 text-sm"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Anmerkungen für das Team…"
            />
            <button onClick={onSaveNote} disabled={savingNote} className="btn-gold text-[0.6rem] py-2 px-4 w-full">
              {savingNote ? "Speichert…" : "Notiz speichern"}
            </button>
          </div>

          <div className="bg-jet/60 border border-border p-6">
            <h3 className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/55 mb-4">Aktionen</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onUpdateStatus("confirmed")} disabled={status === "confirmed"} className="text-[0.6rem] tracking-[0.22em] uppercase py-2.5 border border-green-500/40 text-green-400 hover:bg-green-500/10 disabled:opacity-30 disabled:cursor-not-allowed">Bestätigen</button>
              <button onClick={() => onUpdateStatus("rejected")} disabled={status === "rejected"} className="text-[0.6rem] tracking-[0.22em] uppercase py-2.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed">Ablehnen</button>
              <button onClick={() => onUpdateStatus("pending")} disabled={status === "pending"} className="col-span-2 text-[0.6rem] tracking-[0.22em] uppercase py-2.5 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-30 disabled:cursor-not-allowed">Auf „Offen" zurücksetzen</button>
              <button onClick={onDelete} className="col-span-2 text-[0.6rem] tracking-[0.22em] uppercase py-2.5 border border-border text-cream/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40">Buchung löschen</button>
            </div>
          </div>
        </div>
      </div>

      {/* Nachricht */}
      {freeText && (
        <div className="mt-6 bg-jet/60 border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-gold/15 text-gold text-xs flex items-center justify-center font-medium">04</span>
            <h3 className="text-[0.7rem] tracking-[0.28em] uppercase text-gold">Nachricht des Kunden</h3>
          </div>
          <p className="whitespace-pre-wrap text-sm text-cream/85 leading-relaxed font-light">{freeText}</p>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { session, isAdmin, loading: authLoading } = useAuth();
  const { settings, refresh: refreshSettings } = useSettings();

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [tab, setTab] = useState<"overview" | "bookings" | "vehicles" | "settings">("overview");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DbVehicle | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ kind: "vehicle" | "booking"; id: string } | null>(null);

  // Session timeout
  useEffect(() => {
    if (!session) return;
    const loginTs = Number(localStorage.getItem("admin_login_ts") ?? Date.now());
    if (!localStorage.getItem("admin_login_ts")) localStorage.setItem("admin_login_ts", String(loginTs));
    const remaining = SESSION_MAX_MS - (Date.now() - loginTs);
    if (remaining <= 0) {
      supabase.auth.signOut().then(() => { localStorage.removeItem("admin_login_ts"); navigate({ to: "/admin" }); });
      return;
    }
    const t = setTimeout(async () => {
      await supabase.auth.signOut();
      localStorage.removeItem("admin_login_ts");
      navigate({ to: "/admin" });
    }, remaining);
    return () => clearTimeout(t);
  }, [session, navigate]);

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/admin" });
  }, [session, authLoading, navigate]);

  const load = useCallback(async () => {
    setLoadingData(true);
    const [b, v] = await Promise.all([
      supabase.from("bookings").select("*, vehicles(name)").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("*").order("sort_order", { ascending: true, nullsFirst: false }).order("name"),
    ]);
    setBookings((b.data ?? []) as BookingRow[]);
    setVehicles((v.data ?? []) as VehicleRow[]);
    setLoadingData(false);
  }, []);

  useEffect(() => { if (session && isAdmin) load(); }, [session, isAdmin, load]);

  const updateStatus = async (id: string, status: Status) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (!error) setBookings((p) => p.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const saveNote = async (id: string) => {
    setSavingNote(id);
    const note = noteDrafts[id] ?? "";
    const { error } = await supabase.from("bookings").update({ admin_note: note }).eq("id", id);
    setSavingNote(null);
    if (!error) setBookings((p) => p.map((b) => (b.id === id ? { ...b, admin_note: note } : b)));
  };

  const toggleAvailable = async (v: VehicleRow) => {
    const next = !v.available;
    const { error } = await supabase.from("vehicles").update({ available: next }).eq("id", v.id);
    if (!error) setVehicles((p) => p.map((x) => (x.id === v.id ? { ...x, available: next } : x)));
  };

  const moveVehicle = async (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= vehicles.length) return;
    const reordered = [...vehicles];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    setVehicles(reordered);
    await Promise.all(reordered.map((v, i) => supabase.from("vehicles").update({ sort_order: i }).eq("id", v.id)));
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    const { kind, id } = confirmDelete;
    setConfirmDelete(null);
    if (kind === "vehicle") await supabase.from("vehicles").delete().eq("id", id);
    else await supabase.from("bookings").delete().eq("id", id);
    load();
  };

  const signOut = async () => {
    localStorage.removeItem("admin_login_ts");
    await supabase.auth.signOut();
    navigate({ to: "/admin" });
  };

  // Stats
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const todayCount = bookings.filter((b) => (b.created_at ?? "").slice(0, 10) === todayStr).length;
    const pending = bookings.filter((b) => (b.status ?? "pending") === "pending").length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    let revenue = 0;
    for (const b of bookings) {
      if (b.status !== "confirmed") continue;
      if (!b.created_at || new Date(b.created_at) < monthStart) continue;
      const v = vehicles.find((x) => x.id === b.vehicle_id);
      if (!v) continue;
      const days = Math.max(1, Math.ceil((new Date(b.end_date).getTime() - new Date(b.start_date).getTime()) / 86400000) || 1);
      revenue += Number(v.price_per_day) * days;
    }
    return { todayCount, pending, confirmed, revenue };
  }, [bookings, vehicles]);

  const counts = {
    pending: bookings.filter((b) => (b.status ?? "pending") === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };
  const filteredBookings = statusFilter === "all" ? bookings : bookings.filter((b) => (b.status ?? "pending") === statusFilter);
  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("de-DE") : "—");
  const fmtDateTime = (d?: string | null) => (d ? new Date(d).toLocaleString("de-DE") : "—");
  const lastSignIn = session?.user.last_sign_in_at;

  if (authLoading) return <div className="min-h-screen bg-onyx flex items-center justify-center text-cream/50 text-xs tracking-[0.3em] uppercase">Lade…</div>;
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

  const TABS = [
    { k: "overview", label: "Übersicht" },
    { k: "bookings", label: `Buchungen (${bookings.length})` },
    { k: "vehicles", label: `Fahrzeuge (${vehicles.length})` },
    { k: "settings", label: "Einstellungen" },
  ] as const;

  return (
    <div className="min-h-screen bg-onyx text-cream">
      <header className="border-b border-border px-6 md:px-12 py-5 flex items-center justify-between gap-6 flex-wrap">
        <Link to="/" className="flex items-center gap-4">
          <img src={logo} alt="OBRENT" className="h-10 w-auto" />
          <div>
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/70">{settings.company_name}</div>
            <div className="font-display text-xl">Admin</div>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-xs text-cream/60">{session.user.email}</div>
            {lastSignIn && <div className="text-[0.6rem] text-cream/40 mt-0.5">Letzter Login: {fmtDateTime(lastSignIn)}</div>}
          </div>
          <Link to="/admin/ai-editor" className="text-[0.65rem] tracking-[0.28em] uppercase text-gold/80 hover:text-gold border border-gold/40 px-4 py-2">✦ AI Editor</Link>
          <button onClick={signOut} className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold border border-border px-4 py-2">Abmelden</button>
        </div>
      </header>

      <div className="px-6 md:px-12 pt-8 flex gap-6 md:gap-8 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`pb-3 text-[0.7rem] tracking-[0.28em] uppercase border-b-2 transition whitespace-nowrap ${tab === t.k ? "border-gold text-gold" : "border-transparent text-cream/55 hover:text-cream"}`}>
            {t.label}
          </button>
        ))}
        <button onClick={load} className="ml-auto pb-3 text-[0.7rem] tracking-[0.28em] uppercase text-cream/55 hover:text-gold whitespace-nowrap">↻ Aktualisieren</button>
      </div>

      <main className="px-6 md:px-12 py-8">
        {loadingData ? (
          <div className="text-center py-20 text-cream/40 text-xs tracking-[0.3em] uppercase">Lade…</div>
        ) : tab === "overview" ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { l: "Buchungen heute", v: String(stats.todayCount) },
                { l: "Offene Anfragen", v: String(stats.pending) },
                { l: "Bestätigte Buchungen", v: String(stats.confirmed) },
                { l: "Umsatz dieser Monat", v: formatPrice(stats.revenue) },
              ].map((s) => (
                <div key={s.l} className="bg-jet border border-border p-6">
                  <div className="text-[0.6rem] tracking-[0.28em] uppercase text-cream/50 mb-3">{s.l}</div>
                  <div className="font-display text-3xl text-gold">{s.v}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[0.7rem] tracking-[0.28em] uppercase text-cream/60 mb-3">Letzte Buchungen</div>
              <div className="bg-jet border border-border overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead><tr className="border-b border-border text-left">
                    {["Datum", "Name", "Fahrzeug", "Zeitraum", "Status"].map((h) => <th key={h} className="px-4 py-3 text-[0.6rem] tracking-[0.24em] uppercase text-cream/45 font-medium">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="border-b border-border/60">
                        <td className="px-4 py-3 text-cream/70">{fmtDate(b.created_at)}</td>
                        <td className="px-4 py-3 text-cream">{b.customer_name}</td>
                        <td className="px-4 py-3 text-cream/70">{b.vehicles?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-cream/60">{fmtDate(b.start_date)} – {fmtDate(b.end_date)}</td>
                        <td className="px-4 py-3"><StatusBadge s={(b.status ?? "pending") as Status} /></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-cream/40">Keine Buchungen</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
              <div className="flex items-center gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")} className="lux-input !py-2 !w-auto">
                  <option value="all">Alle</option>
                  <option value="pending">Offen</option>
                  <option value="confirmed">Bestätigt</option>
                  <option value="rejected">Abgelehnt</option>
                </select>
                <button onClick={() => downloadBookingsCsv(bookings)} className="btn-ghost text-[0.65rem] py-2 px-4">CSV Export</button>
              </div>
            </div>
            <section className="bg-jet border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead><tr className="border-b border-border text-left">
                  {["", "Datum", "Name", "E-Mail", "Telefon", "Fahrzeug", "Zeitraum", "Status", "Aktionen"].map((h, i) => (
                    <th key={i} className="px-4 py-4 text-[0.6rem] tracking-[0.24em] uppercase text-cream/45 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredBookings.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-cream/40">Keine Buchungen</td></tr>}
                  {filteredBookings.map((b) => {
                    const status = (b.status ?? "pending") as Status;
                    const isOpen = expandedBooking === b.id;
                    const note = noteDrafts[b.id] ?? b.admin_note ?? "";
                    return (
                      <Fragment key={b.id}>
                        <tr className="border-b border-border/60 align-top hover:bg-onyx/40 cursor-pointer" onClick={() => setExpandedBooking(isOpen ? null : b.id)}>
                          <td className="px-4 py-4 text-gold">{isOpen ? "▼" : "▸"}</td>
                          <td className="px-4 py-4 text-cream/70 whitespace-nowrap">{fmtDate(b.created_at)}</td>
                          <td className="px-4 py-4 text-cream">{b.customer_name}</td>
                          <td className="px-4 py-4 text-cream/70">{b.email}</td>
                          <td className="px-4 py-4 text-cream/70">{b.phone ?? "—"}</td>
                          <td className="px-4 py-4 text-cream/80">{b.vehicles?.name ?? "—"}</td>
                          <td className="px-4 py-4 text-cream/70 whitespace-nowrap">{fmtDate(b.start_date)} – {fmtDate(b.end_date)}</td>
                          <td className="px-4 py-4"><StatusBadge s={status} /></td>
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1">
                              <button onClick={() => updateStatus(b.id, "confirmed")} disabled={status === "confirmed"} className="text-[0.6rem] tracking-[0.22em] uppercase text-green-400 hover:text-gold disabled:opacity-30 text-left">Bestätigen</button>
                              <button onClick={() => updateStatus(b.id, "rejected")} disabled={status === "rejected"} className="text-[0.6rem] tracking-[0.22em] uppercase text-red-400 hover:text-gold disabled:opacity-30 text-left">Ablehnen</button>
                              <button onClick={() => setConfirmDelete({ kind: "booking", id: b.id })} className="text-[0.6rem] tracking-[0.22em] uppercase text-cream/50 hover:text-red-400 text-left">Löschen</button>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="bg-onyx/40 border-b border-border">
                            <td colSpan={9} className="px-0 py-0">
                              <BookingDetails
                                booking={b}
                                note={note}
                                onNoteChange={(v) => setNoteDrafts((d) => ({ ...d, [b.id]: v }))}
                                onSaveNote={() => saveNote(b.id)}
                                savingNote={savingNote === b.id}
                                onUpdateStatus={(s) => updateStatus(b.id, s)}
                                onDelete={() => setConfirmDelete({ kind: "booking", id: b.id })}
                                fmtDate={fmtDate}
                                fmtDateTime={fmtDateTime}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </>
        ) : tab === "vehicles" ? (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="text-sm text-cream/60">{vehicles.length} Fahrzeuge insgesamt</div>
              <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-gold text-[0.65rem] py-3 px-6">+ Fahrzeug hinzufügen</button>
            </div>
            <section className="bg-jet border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead><tr className="border-b border-border text-left">
                  {["Reihenfolge", "Bild", "Name", "Kategorie", "Preis / Tag", "Verfügbar", "Aktionen"].map((h) => (
                    <th key={h} className="px-4 py-4 text-[0.6rem] tracking-[0.24em] uppercase text-cream/45 font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {vehicles.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-cream/40">Keine Fahrzeuge</td></tr>}
                  {vehicles.map((v, i) => (
                    <tr key={v.id} className="border-b border-border/60 hover:bg-onyx/40">
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <button onClick={() => moveVehicle(i, -1)} disabled={i === 0} className="text-gold hover:text-cream disabled:opacity-20 text-xs">▲</button>
                          <button onClick={() => moveVehicle(i, 1)} disabled={i === vehicles.length - 1} className="text-gold hover:text-cream disabled:opacity-20 text-xs">▼</button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {v.images?.[0] ? <img src={v.images[0]} loading="lazy" decoding="async" alt={v.name} className="w-20 h-14 object-cover border border-border" /> : <div className="w-20 h-14 bg-onyx border border-border" />}
                      </td>
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
        ) : (
          <div className="space-y-8">
            <WebsiteStatusPanel />
            <SettingsPanel initial={settings} onSaved={refreshSettings} />
          </div>
        )}
      </main>

      {modalOpen && (
        <VehicleModal initial={editing ? vehicleToForm(editing) : emptyForm} editingId={editing?.id ?? null} onClose={() => setModalOpen(false)} onSaved={load} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={confirmDelete.kind === "vehicle" ? "Fahrzeug wirklich löschen?" : "Buchung wirklich löschen?"}
          onConfirm={doDelete} onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function SettingsPanel({ initial, onSaved }: { initial: AppSettings; onSaved: () => void }) {
  const [form, setForm] = useState<AppSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { setForm(initial); }, [initial]);
  const set = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    setSaving(true); setMsg(null);
    const err = await saveSettings(form);
    setSaving(false);
    if (err) setMsg("Fehler: " + err.message);
    else { setMsg("Einstellungen gespeichert ✓"); onSaved(); setTimeout(() => setMsg(null), 3000); }
  };
  return (
    <div className="max-w-2xl bg-jet border border-border p-8 space-y-5">
      <div>
        <h2 className="font-display text-2xl text-cream mb-1">Firmen-Einstellungen</h2>
        <p className="text-xs text-cream/50">Wird automatisch im Footer und auf der Kontaktseite angezeigt.</p>
      </div>
      <Field label="Firmenname"><input className="lux-input" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></Field>
      <Field label="Adresse (mit Komma trennen für mehrere Zeilen)"><input className="lux-input" value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
      <Field label="Telefon"><input className="lux-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
      <Field label="E-Mail"><input className="lux-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
      <Field label="Öffnungszeiten (eine pro Zeile)"><textarea className="lux-input min-h-[100px]" value={form.hours} onChange={(e) => set("hours", e.target.value)} /></Field>
      {msg && <div className={`text-sm ${msg.startsWith("Fehler") ? "text-red-400" : "text-green-400"}`}>{msg}</div>}
      <div className="flex justify-end">
        <button onClick={submit} disabled={saving} className="btn-gold text-[0.65rem] py-3 px-6 disabled:opacity-60">{saving ? "Speichert…" : "Speichern"}</button>
      </div>
    </div>
  );
}

function WebsiteStatusPanel() {
  const { enabled, loading, refresh } = useMaintenance();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const toggle = async () => {
    setSaving(true);
    setMsg(null);
    const err = await setMaintenance(!enabled);
    setSaving(false);
    if (err) setMsg("Fehler: " + err.message);
    else {
      await refresh();
      setMsg("Status aktualisiert ✓");
      setTimeout(() => setMsg(null), 2500);
    }
  };

  return (
    <div className="max-w-2xl bg-jet border border-border p-8 space-y-6">
      <div>
        <h2 className="font-display text-2xl text-cream mb-1">Website Status</h2>
        <p className="text-xs text-cream/50">
          Schaltet die öffentliche Website in den Wartungsmodus. /admin bleibt immer erreichbar.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border border-border bg-onyx px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              enabled ? "bg-red-500 animate-pulse" : "bg-green-500"
            }`}
          />
          <span
            className={`text-[0.7rem] tracking-[0.32em] uppercase font-medium ${
              enabled ? "text-red-400" : "text-green-400"
            }`}
          >
            {loading ? "…" : enabled ? "In Bearbeitung" : "Live"}
          </span>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={saving || loading}
          aria-pressed={enabled}
          aria-label="Website in Bearbeitung"
          className={`relative inline-flex h-7 w-14 shrink-0 items-center rounded-full border transition-colors disabled:opacity-60 ${
            enabled ? "bg-red-500/80 border-red-400" : "bg-cream/10 border-border"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-cream transition-transform ${
              enabled ? "translate-x-8" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="text-xs text-cream/55 leading-relaxed">
        <strong className="text-cream/80">Website in Bearbeitung:</strong>{" "}
        Wenn aktiv, sehen alle Besucher eine Wartungsseite anstelle der normalen Inhalte.
        Schalten Sie diesen Schalter aus, um die Website wieder live zu schalten.
      </div>

      {msg && (
        <div className={`text-sm ${msg.startsWith("Fehler") ? "text-red-400" : "text-green-400"}`}>
          {msg}
        </div>
      )}
    </div>
  );
}

