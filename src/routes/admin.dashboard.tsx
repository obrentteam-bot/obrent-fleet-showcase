import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { formatPrice } from "@/lib/vehicles";

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
  { ref: "OBR-24081", client: "J. Beaumont",     vehicle: "Phantom VIII",         city: "Monaco", start: "12 May",  end: "14 May",  total: 4800, status: "confirmed" },
  { ref: "OBR-24082", client: "A. Khalid",       vehicle: "Cullinan Black Badge", city: "Dubai",  start: "15 May",  end: "20 May",  total: 10750, status: "pending" },
  { ref: "OBR-24083", client: "S. Marchetti",    vehicle: "812 Superfast",        city: "Monaco", start: "16 May",  end: "17 May",  total: 1850, status: "confirmed" },
  { ref: "OBR-24084", client: "Mme. Dubois",     vehicle: "Dawn",                 city: "Paris",  start: "18 May",  end: "21 May",  total: 5850, status: "pending" },
  { ref: "OBR-24085", client: "Lord Ashcombe",   vehicle: "Continental GT Speed", city: "Paris",  start: "20 May",  end: "27 May",  total: 10150, status: "confirmed" },
  { ref: "OBR-24086", client: "R. Nakamura",     vehicle: "Huracán Tecnica",      city: "Monaco", start: "22 May",  end: "23 May",  total: 1750, status: "rejected" },
  { ref: "OBR-24087", client: "Mme. Albright",   vehicle: "Bentayga EWB",         city: "Dubai",  start: "25 May",  end: "29 May",  total: 6600, status: "pending" },
  { ref: "OBR-24088", client: "F. Castellanos",  vehicle: "DB12 Volante",         city: "Monaco", start: "27 May",  end: "30 May",  total: 4650, status: "confirmed" },
];

const stats = [
  { label: "Active Reservations", value: "12" },
  { label: "Pending Approval", value: "3" },
  { label: "Revenue · May", value: formatPrice(186400) },
  { label: "Fleet Utilisation", value: "78%" },
];

function StatusBadge({ s }: { s: Status }) {
  const map: Record<Status, { bg: string; dot: string; label: string; text: string }> = {
    pending:   { bg: "bg-status-pending/10",   dot: "bg-status-pending",   text: "text-status-pending",   label: "Pending"   },
    confirmed: { bg: "bg-status-confirmed/10", dot: "bg-status-confirmed", text: "text-status-confirmed", label: "Confirmed" },
    rejected:  { bg: "bg-status-rejected/10",  dot: "bg-status-rejected",  text: "text-status-rejected",  label: "Rejected"  },
  };
  const c = map[s];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 ${c.bg} ${c.text} border border-current/20`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className="text-[0.65rem] tracking-[0.22em] uppercase font-medium">{c.label}</span>
    </span>
  );
}

function AdminDashboard() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen bg-onyx flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-jet border-r border-border flex-col">
        <div className="p-8 border-b border-border">
          <Link to="/" className="font-display text-xl tracking-[0.18em] text-cream">
            OB<span className="text-gold">RENT</span>
          </Link>
          <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/70 mt-1">Concierge</div>
        </div>
        <nav className="flex-1 p-6 space-y-1">
          {[
            { label: "Reservations", active: true },
            { label: "Fleet" },
            { label: "Clients" },
            { label: "Calendar" },
            { label: "Reports" },
            { label: "Settings" },
          ].map((i) => (
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
        <div className="p-6 border-t border-border">
          <Link to="/admin" className="text-xs tracking-[0.24em] uppercase text-cream/45 hover:text-gold">
            ← Sign Out
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-border px-6 md:px-12 py-6 flex items-center justify-between">
          <div>
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-cream/40 mb-1">Tuesday, 14 May</div>
            <h1 className="font-display text-3xl text-cream">Reservations</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-ghost text-[0.65rem] py-3 px-5">Export</button>
            <button className="btn-gold text-[0.65rem] py-3 px-5">New Reservation</button>
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
                {f === "all" ? "All" : f}
              </button>
            ))}
            <span className="ml-auto text-[0.65rem] tracking-[0.28em] uppercase text-cream/40">{filtered.length} entries</span>
          </section>

          {/* Bookings table */}
          <section className="bg-jet border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-border">
                  {["Reference", "Client", "Motorcar", "City", "Dates", "Total", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-5 text-[0.6rem] tracking-[0.28em] uppercase text-cream/45 font-medium">
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
                    <td className="px-6 py-5"><StatusBadge s={b.status} /></td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/55 hover:text-gold transition">View →</button>
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
