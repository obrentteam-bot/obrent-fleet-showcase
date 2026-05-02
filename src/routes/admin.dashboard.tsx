import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatPrice } from "@/lib/vehicles";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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

interface Booking {
  ref: string;
  client: string;
  vehicle: string;
  city: string;
  start: string;
  end: string;
  total: number;
  status: Status;
}

const bookings: Booking[] = [
  { ref: "OBR-24081", client: "J. Beaumont",     vehicle: "Phantom VIII",         city: "Monaco", start: "12. Mai", end: "14. Mai", total: 4800, status: "confirmed" },
  { ref: "OBR-24082", client: "A. Khalid",       vehicle: "Cullinan Black Badge", city: "Dubai",  start: "15. Mai", end: "20. Mai", total: 10750, status: "pending" },
  { ref: "OBR-24083", client: "S. Marchetti",    vehicle: "812 Superfast",        city: "Monaco", start: "16. Mai", end: "17. Mai", total: 1850, status: "confirmed" },
  { ref: "OBR-24084", client: "Mme. Dubois",     vehicle: "Dawn",                 city: "Paris",  start: "18. Mai", end: "21. Mai", total: 5850, status: "pending" },
  { ref: "OBR-24085", client: "Lord Ashcombe",   vehicle: "Continental GT Speed", city: "Paris",  start: "20. Mai", end: "27. Mai", total: 10150, status: "confirmed" },
  { ref: "OBR-24086", client: "R. Nakamura",     vehicle: "Huracán Tecnica",      city: "Monaco", start: "22. Mai", end: "23. Mai", total: 1750, status: "rejected" },
  { ref: "OBR-24087", client: "Mme. Albright",   vehicle: "Bentayga EWB",         city: "Dubai",  start: "25. Mai", end: "29. Mai", total: 6600, status: "pending" },
  { ref: "OBR-24088", client: "F. Castellanos",  vehicle: "DB12 Volante",         city: "Monaco", start: "27. Mai", end: "30. Mai", total: 4650, status: "confirmed" },
];

function StatusBadge({ s, label }: { s: Status; label: string }) {
  const map: Record<Status, { bg: string; dot: string; text: string }> = {
    pending:   { bg: "bg-status-pending/10",   dot: "bg-status-pending",   text: "text-status-pending"   },
    confirmed: { bg: "bg-status-confirmed/10", dot: "bg-status-confirmed", text: "text-status-confirmed" },
    rejected:  { bg: "bg-status-rejected/10",  dot: "bg-status-rejected",  text: "text-status-rejected"  },
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
  const [filter, setFilter] = useState<Status | "all">("all");
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const stats = [
    { label: t.admin.stats.active, value: "12" },
    { label: t.admin.stats.pending, value: "3" },
    { label: t.admin.stats.revenue, value: formatPrice(186400) },
    { label: t.admin.stats.utilisation, value: "78%" },
  ];

  const sidebar = [
    { label: t.admin.sidebar.reservations, active: true },
    { label: t.admin.sidebar.fleet },
    { label: t.admin.sidebar.clients },
    { label: t.admin.sidebar.calendar },
    { label: t.admin.sidebar.reports },
    { label: t.admin.sidebar.settings },
  ];

  const filterLabels: Record<Status | "all", string> = {
    all: t.admin.status.all,
    pending: t.admin.status.pending,
    confirmed: t.admin.status.confirmed,
    rejected: t.admin.status.rejected,
  };

  return (
    <div className="min-h-screen bg-onyx flex">
      {/* Sidebar */}
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
          <Link to="/admin" className="text-xs tracking-[0.24em] uppercase text-cream/45 hover:text-gold">
            {t.admin.sidebar.signOut}
          </Link>
          <LanguageSwitcher />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-6 md:px-12 py-6 flex items-center justify-between">
          <div>
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-cream/40 mb-1">{t.admin.dateLabel}</div>
            <h1 className="font-display text-3xl text-cream">{t.admin.reservations}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-ghost text-[0.65rem] py-3 px-5">{t.admin.export}</button>
            <button className="btn-gold text-[0.65rem] py-3 px-5">{t.admin.newReservation}</button>
          </div>
        </header>

        <div className="p-6 md:p-12 space-y-10">
          {/* Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
            {stats.map((s) => (
              <div key={s.label} className="bg-jet p-8">
                <div className="text-[0.6rem] tracking-[0.3em] uppercase text-cream/45 mb-3">{s.label}</div>
                <div className="font-display text-4xl text-cream">{s.value}</div>
              </div>
            ))}
          </section>

          {/* Filters */}
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

          {/* Bookings table */}
          <section className="bg-jet border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  {[t.admin.table.reference, t.admin.table.client, t.admin.table.vehicle, t.admin.table.city, t.admin.table.dates, t.admin.table.total, t.admin.table.status, ""].map((h, i) => (
                    <th key={i} className="text-left px-6 py-5 text-[0.6rem] tracking-[0.28em] uppercase text-cream/45 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.ref} className="border-b border-border/60 hover:bg-onyx/40 transition">
                    <td className="px-6 py-5 font-mono text-xs text-gold/90 tracking-wider">{b.ref}</td>
                    <td className="px-6 py-5 text-cream">{b.client}</td>
                    <td className="px-6 py-5 text-cream/80">{b.vehicle}</td>
                    <td className="px-6 py-5 text-cream/60">{b.city}</td>
                    <td className="px-6 py-5 text-cream/60">{b.start} — {b.end}</td>
                    <td className="px-6 py-5 font-display text-base text-cream">{formatPrice(b.total)}</td>
                    <td className="px-6 py-5"><StatusBadge s={b.status} label={filterLabels[b.status]} /></td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/55 hover:text-gold transition">{t.admin.table.view}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
