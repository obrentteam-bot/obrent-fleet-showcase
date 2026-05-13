import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { Plane, UserCheck, Briefcase } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroImg from "@/assets/hero-fleet.jpg";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Premium Services — OBRENT" },
      { name: "description", content: "VIP Shuttle, Chauffeur Service und Business Langzeitmiete von OBRENT — diskret, komfortabel, zuverlässig." },
      { property: "og:title", content: "Premium Services — OBRENT" },
      { property: "og:description", content: "Diskrete, komfortable Mobilitätslösungen auf höchstem Niveau." },
    ],
  }),
  component: ServicesPage,
});

const SERVICE_OPTIONS = [
  { value: "vip-shuttle", labelKey: "vipShuttle" as const },
  { value: "chauffeur-service", labelKey: "chauffeur" as const },
  { value: "business-langzeitmiete", labelKey: "longterm" as const },
];

function ServicesPage() {
  const { t } = useI18n();
  const s = t.services;

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState<string>("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    const today = new Date().toISOString().slice(0, 10);
    const serviceLabel = service
      ? t.servicesMenu[SERVICE_OPTIONS.find((o) => o.value === service)!.labelKey]
      : "—";
    const body = [
      `Service: ${serviceLabel}`,
      company && `Unternehmen: ${company}`,
      date && `Zeitraum: ${date}`,
      location && `Ort: ${location}`,
      message && `Nachricht: ${message}`,
    ].filter(Boolean).join("\n");
    const { error } = await supabase.from("bookings").insert({
      vehicle_id: null,
      customer_name: name || "—",
      email,
      phone,
      start_date: today,
      end_date: today,
      message: body,
      status: "pending",
    });
    setSubmitting(false);
    if (error) setSubmitError(error.message);
    else setSubmitted(true);
  };

  const serviceCards = [
    { id: "vip-shuttle", path: "/services/vip-shuttle" as const, title: s.vip.title, body: s.vip.body, Icon: Plane },
    { id: "chauffeur-service", path: "/services/chauffeur-service" as const, title: s.chauffeur.title, body: s.chauffeur.body, Icon: UserCheck },
    { id: "business-langzeitmiete", path: "/services/business-langzeitmiete" as const, title: s.longterm.title, body: s.longterm.body, Icon: Briefcase },
  ];

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative min-h-[80vh] flex items-end pt-40 pb-20 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-onyx/70 via-onyx/60 to-onyx" />
        </div>
        <div className="relative max-w-[1100px] mx-auto w-full">
          <div className="flex items-center gap-4 mb-8">
            <span className="gold-rule" />
            <span className="eyebrow">{s.eyebrow}</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95]">
            {s.heroTitle}{" "}
            <span className="italic text-gold/90 font-light">{s.heroItalic}</span>
          </h1>
          <p className="mt-8 text-lg text-cream/70 font-light max-w-2xl leading-relaxed">
            {s.heroLead}
          </p>
          <div className="mt-12 h-px w-24 bg-gold/60" />
        </div>
      </section>

      {/* SERVICE CARDS */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {serviceCards.map(({ id, title, body, Icon }, i) => (
            <article
              key={id}
              id={id}
              className="group relative scroll-mt-32 border border-border/60 bg-[#1A1A1A] p-10 lg:p-12 transition-all duration-500 hover:border-gold/60"
            >
              <div className="flex items-center gap-3 mb-10">
                <span className="font-display italic text-gold/70 text-sm">0{i + 1}</span>
                <span className="h-px w-8 bg-gold/40" />
              </div>
              <Icon className="w-10 h-10 text-gold mb-8" strokeWidth={1.25} />
              <h3 className="font-display text-2xl md:text-3xl text-cream leading-tight mb-5">
                {title}
              </h3>
              <p className="text-cream/60 text-sm leading-relaxed font-light">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* TRANSITION + FORM */}
      <section id="anfrage" className="py-24 px-6 md:px-12 scroll-mt-32">
        <div className="max-w-[900px] mx-auto">
          <div className="flex justify-center mb-16">
            <span className="h-px w-32 bg-gold/60" />
          </div>
          <div className="text-center mb-14">
            <div className="eyebrow text-gold/80 mb-6">{s.formEyebrow}</div>
            <h2 className="font-display text-4xl md:text-6xl text-cream leading-[0.95] mb-6">
              {s.formTitle} <span className="italic text-gold/90 font-light">{s.formItalic}</span>
            </h2>
            <p className="text-cream/60 font-light max-w-xl mx-auto">
              {s.contactSubline}
            </p>
          </div>

          {submitted ? (
            <div className="py-16 border border-gold/30 bg-onyx/40 text-center">
              <div className="eyebrow text-gold mb-4">✓</div>
              <p className="text-cream/80">{s.form.success}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div>
                <label className="lux-label">{s.form.name}</label>
                <input className="lux-input" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="lux-label">{s.form.company}</label>
                <input className="lux-input" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <label className="lux-label">{s.form.phone}</label>
                <input className="lux-input" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="lux-label">{s.form.email}</label>
                <input className="lux-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{s.form.service}</label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className="lux-input h-auto">
                    <SelectValue placeholder={s.form.servicePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {t.servicesMenu[o.labelKey]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="lux-label">{s.form.date}</label>
                <input className="lux-input" type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="z.B. 12.06.2026 — 18.06.2026" />
              </div>
              <div>
                <label className="lux-label">{s.form.location}</label>
                <input className="lux-input" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="lux-label">{s.form.message}</label>
                <textarea className="lux-input resize-none" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              {submitError && (
                <div className="md:col-span-2 text-sm text-red-400/90">{submitError}</div>
              )}
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "…" : s.form.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
