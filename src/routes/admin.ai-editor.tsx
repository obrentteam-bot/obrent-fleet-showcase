import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase, formatPrice, type DbVehicle } from "@/lib/supabase";
import logo from "@/assets/obrent-logo.png";

type VehicleRow = Pick<
  DbVehicle,
  "id" | "name" | "category" | "price_per_day" | "available" | "description"
>;

export const Route = createFileRoute("/admin/ai-editor")({
  head: () => ({
    meta: [
      { title: "AI Editor — OBRENT Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AiEditorPage,
});

type Risk = "low" | "medium" | "high";
type ProposalStatus = "pending" | "applied" | "rejected";
type ProposalType = "copy" | "price" | "metadata" | "translation" | "setting" | "create";

type Proposal = {
  id: string;
  summary: string;
  target: string;
  type: ProposalType;
  change: string;
  risk: Risk;
  status: ProposalStatus;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposals?: Proposal[];
  vehicles?: VehicleRow[];
  vehiclesError?: string;
  ts: number;
};

const RISK_STYLE: Record<Risk, string> = {
  low: "bg-green-500/10 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/10 text-red-400 border-red-500/30",
};
const RISK_LABEL: Record<Risk, string> = { low: "Niedrig", medium: "Mittel", high: "Hoch" };

const TYPE_LABEL: Record<ProposalType, string> = {
  copy: "Text",
  price: "Preis",
  metadata: "Metadaten",
  translation: "Übersetzung",
  setting: "Einstellung",
  create: "Neuanlage",
};

const STATUS_STYLE: Record<ProposalStatus, string> = {
  pending: "bg-cream/5 text-cream/70 border-cream/20",
  applied: "bg-gold/10 text-gold border-gold/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
};
const STATUS_LABEL: Record<ProposalStatus, string> = {
  pending: "Vorschlag",
  applied: "Angewendet",
  rejected: "Abgelehnt",
};

const SUGGESTIONS: string[] = [
  "Fahrzeuge anzeigen",
  "Preis ändern",
  "Fahrzeug hinzufügen",
  "SEO prüfen",
  "Text optimieren",
  "Einstellungen ändern",
];

type Area = "vehicles" | "settings" | "seo" | "translation" | "website";
type Action = "list" | "add" | "price" | "optimize" | "change" | "info";

const AREA_LABEL: Record<Area, string> = {
  vehicles: "Fahrzeuge",
  settings: "Einstellungen",
  seo: "SEO",
  translation: "Übersetzungen",
  website: "Website",
};

function detect(prompt: string): { area: Area; action: Action } {
  const p = prompt.toLowerCase();

  // Area
  let area: Area = "website";
  if (/(fahrzeug|auto|wagen|modell|audi|bmw|mercedes|ferrari|porsche|lamborghini|rs\d|g-klasse|preis|€|eur)/.test(p)) area = "vehicles";
  else if (/(seo|meta|description|titel|og:|sitemap|keyword)/.test(p)) area = "seo";
  else if (/(übersetz|uebersetz|translate|englisch|english|französisch|franzoesisch|i18n|sprache)/.test(p)) area = "translation";
  else if (/(einstellung|telefon|adresse|öffnungszeit|oeffnungszeit|kontakt|impressum|email|e-mail)/.test(p)) area = "settings";
  else if (/(startseite|hero|seite|website|landing|sektion|über uns|ueber uns)/.test(p)) area = "website";

  // Action
  let action: Action = "info";
  if (/(zeig|liste|alle|übersicht|uebersicht|anzeigen|show|display|welche)/.test(p)) action = "list";
  else if (/(hinzufüg|hinzufueg|neu anleg|anlegen|erstell|add|füge.*hinzu|fuege.*hinzu)/.test(p)) action = "add";
  else if (/(preis|€|eur|pro tag|tagespreis)/.test(p) && /(ändere|aendere|setze|update|neuer preis|auf \d)/.test(p)) action = "price";
  else if (/(optimier|verbesser|vorschlag|umschreib|verfeiner|kürzen|kuerzen|prüf|pruef|check)/.test(p)) action = "optimize";
  else if (/(ändere|aendere|update|anpassen|setze|change)/.test(p)) action = "change";

  // Heuristic: if user mentions a price assignment, ensure area = vehicles
  if (action === "price") area = "vehicles";

  return { area, action };
}

function makeProposal(area: Area, action: Action, prompt: string): Proposal {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (area === "vehicles" && action === "price") {
    return {
      id,
      summary: "Tagespreis eines Fahrzeugs anpassen",
      target: "Fahrzeug · (aus Eingabe extrahiert)",
      type: "price",
      change: `Auftrag: "${prompt}"\nGeplante Aktion: price_per_day im Eintrag des genannten Fahrzeugs aktualisieren.`,
      risk: "medium",
      status: "pending",
    };
  }
  if (area === "vehicles" && action === "add") {
    return {
      id,
      summary: "Neues Fahrzeug anlegen",
      target: "Tabelle · vehicles",
      type: "create",
      change: `Auftrag: "${prompt}"\nGeplante Aktion: Neuer Eintrag in vehicles (Name, Kategorie, Preis, Beschreibung, Bilder fehlen noch).`,
      risk: "high",
      status: "pending",
    };
  }
  if (area === "seo") {
    return {
      id,
      summary: "SEO-Metadaten optimieren",
      target: "SEO · (Seite aus Eingabe ableiten)",
      type: "metadata",
      change: `Auftrag: "${prompt}"\nGeplante Aktion: Meta-Title (<60), Description (<160), OG-Tags überarbeiten.`,
      risk: "low",
      status: "pending",
    };
  }
  if (area === "translation") {
    return {
      id,
      summary: "Übersetzung ergänzen / anpassen",
      target: "i18n · (Schlüssel aus Eingabe ableiten)",
      type: "translation",
      change: `Auftrag: "${prompt}"\nGeplante Aktion: Sprachvariante (DE/EN/FR) hinzufügen oder korrigieren.`,
      risk: "low",
      status: "pending",
    };
  }
  if (area === "settings") {
    return {
      id,
      summary: "Globale Einstellung aktualisieren",
      target: "Einstellungen · (Feld aus Eingabe ableiten)",
      type: "setting",
      change: `Auftrag: "${prompt}"\nGeplante Aktion: Kontakt / Öffnungszeiten / Stammdaten anpassen.`,
      risk: "medium",
      status: "pending",
    };
  }
  // website / fallback
  return {
    id,
    summary: "Website-Text überarbeiten",
    target: "Website · (Sektion aus Eingabe ableiten)",
    type: "copy",
    change: `Auftrag: "${prompt}"\nGeplante Aktion: Headline / Body-Text klarer und nutzenorientierter formulieren.`,
    risk: "low",
    status: "pending",
  };
}

function AiEditorPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      ts: Date.now(),
      content:
        "Willkommen im AI Editor. Schreib einfach, was du ändern möchtest — z. B. \"Zeig mir alle Fahrzeuge und Preise\", \"Ändere den Audi RS6 auf 499 € pro Tag\" oder \"Optimiere die Startseite für SEO\". Ich erkenne Bereich und Absicht automatisch. (Mock-Modus: keine Änderungen werden gespeichert.)",
    },
  ]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!session || !isAdmin) navigate({ to: "/admin" });
  }, [session, isAdmin, loading, navigate]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-onyx text-cream/40 text-xs tracking-[0.3em] uppercase">
        Lade…
      </div>
    );
  }

  const submit = async (textRaw: string) => {
    const text = textRaw.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setSending(true);

    const { area, action } = detect(text);
    const replyId = `a-${Date.now()}`;

    // Real read of vehicles when listing.
    if (area === "vehicles" && action === "list") {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, name, category, price_per_day, available, description")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      setMessages((m) => [
        ...m,
        error
          ? {
              id: replyId,
              role: "assistant",
              ts: Date.now(),
              content: `Konnte die Fahrzeuge nicht laden: ${error.message}`,
              vehiclesError: error.message,
            }
          : {
              id: replyId,
              role: "assistant",
              ts: Date.now(),
              content: `Bereich erkannt: ${AREA_LABEL[area]} · Aktion: Liste.\nHier sind die aktuellen Fahrzeuge aus der Datenbank (${data?.length ?? 0} Einträge). Nur-Lese — keine Vorschläge.`,
              vehicles: (data ?? []) as VehicleRow[],
            },
      ]);
      setSending(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 600));

    if (action === "info") {
      setMessages((m) => [
        ...m,
        {
          id: replyId,
          role: "assistant",
          ts: Date.now(),
          content: `Bereich erkannt: ${AREA_LABEL[area]}. Ich erstelle keinen Vorschlag ohne klare Absicht.\n\nBeispiele:\n· "Zeig mir alle Fahrzeuge und Preise"\n· "Ändere den Audi RS6 auf 499 € pro Tag"\n· "Optimiere die Startseite für SEO"`,
        },
      ]);
      setSending(false);
      return;
    }

    const proposal = makeProposal(area, action, text);
    setMessages((m) => [
      ...m,
      {
        id: replyId,
        role: "assistant",
        ts: Date.now(),
        content: `Bereich erkannt: ${AREA_LABEL[area]} · Aktion: ${action}.\nVorschlag erstellt (Mock — wird nicht angewendet).`,
        proposals: [proposal],
      },
    ]);
    setSending(false);
  };

  const updateProposal = (msgId: string, propId: string, status: ProposalStatus) => {
    setMessages((msgs) =>
      msgs.map((m) =>
        m.id !== msgId || !m.proposals
          ? m
          : { ...m, proposals: m.proposals.map((p) => (p.id === propId ? { ...p, status } : p)) },
      ),
    );
  };

  return (
    <div className="min-h-screen bg-onyx text-cream flex flex-col">
      <header className="border-b border-border px-6 md:px-12 py-5 flex items-center justify-between gap-6 flex-wrap">
        <Link to="/admin/dashboard" className="flex items-center gap-4">
          <img src={logo} alt="OBRENT" className="h-10 w-auto" />
          <div>
            <div className="text-[0.6rem] tracking-[0.3em] uppercase text-gold/70">OBRENT</div>
            <div className="font-display text-xl">AI Editor</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[0.6rem] tracking-[0.28em] uppercase text-gold/70 border border-gold/30 px-3 py-1.5">
            Mock-Modus
          </span>
          <Link
            to="/admin/dashboard"
            className="text-[0.65rem] tracking-[0.28em] uppercase text-cream/70 hover:text-gold border border-border px-4 py-2"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 md:px-12 py-8 max-w-5xl w-full mx-auto flex flex-col min-h-0">
        <div className="mb-6">
          <div className="eyebrow mb-2">Unified Chat</div>
          <div className="font-display text-2xl text-cream">Was möchtest du ändern?</div>
          <p className="text-cream/55 text-sm mt-1">
            Schreib natürlich — ich erkenne Bereich (Fahrzeuge, SEO, Einstellungen, Übersetzungen, Website) und Absicht automatisch.
          </p>
        </div>

        <div
          ref={scrollerRef}
          className="flex-1 border border-border bg-jet/30 p-5 md:p-7 overflow-y-auto space-y-6 min-h-[420px]"
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} onProposalAction={updateProposal} />
          ))}
          {sending && (
            <div className="flex items-center gap-3 text-cream/50 text-xs tracking-[0.25em] uppercase">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gold/70 rounded-full animate-pulse [animation-delay:300ms]" />
              </span>
              AI denkt nach…
            </div>
          )}
        </div>

        <div className="mt-5 border border-border bg-jet/40 p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit(prompt);
              }
            }}
            rows={3}
            placeholder='z. B. "Zeig mir alle Fahrzeuge und Preise" (⌘/Ctrl + Enter zum Senden)'
            className="w-full bg-transparent text-cream placeholder:text-cream/30 text-sm font-light leading-relaxed resize-none focus:outline-none"
          />
          <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border/60">
            <span className="text-[0.6rem] tracking-[0.28em] uppercase text-cream/40">
              Keine Änderungen werden gespeichert
            </span>
            <button
              onClick={() => submit(prompt)}
              disabled={sending || !prompt.trim()}
              className="text-[0.65rem] tracking-[0.28em] uppercase border border-gold text-gold px-5 py-2 hover:bg-gold hover:text-onyx transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
            >
              {sending ? "Sende…" : "Senden →"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/60">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                disabled={sending}
                className="text-[0.6rem] tracking-[0.25em] uppercase border border-border text-cream/65 px-3 py-1.5 hover:text-gold hover:border-gold/50 transition-colors disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({
  msg,
  onProposalAction,
}: {
  msg: ChatMessage;
  onProposalAction: (msgId: string, propId: string, status: ProposalStatus) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`${msg.vehicles ? "max-w-full w-full" : "max-w-[85%]"} ${isUser ? "items-end" : "items-start"} flex flex-col gap-3`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border ${
            isUser
              ? "bg-gold/10 border-gold/30 text-cream"
              : "bg-onyx/60 border-border text-cream/85"
          }`}
        >
          <div className="text-[0.55rem] tracking-[0.3em] uppercase mb-2 opacity-60">
            {isUser ? "Du" : "AI Editor"}
          </div>
          {msg.content}
        </div>

        {msg.vehicles && <VehicleTable rows={msg.vehicles} />}

        {msg.proposals?.map((p) => (
          <ProposalCard
            key={p.id}
            proposal={p}
            onAccept={() => onProposalAction(msg.id, p.id, "applied")}
            onReject={() => onProposalAction(msg.id, p.id, "rejected")}
          />
        ))}
      </div>
    </div>
  );
}

function ProposalCard({
  proposal,
  onAccept,
  onReject,
}: {
  proposal: Proposal;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { summary, target, type, change, risk, status } = proposal;
  return (
    <div className="w-full border border-border bg-jet/60 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-1">
            Vorschlag · {TYPE_LABEL[type]}
          </div>
          <div className="font-display text-lg text-cream leading-snug">{summary}</div>
        </div>
        <span
          className={`shrink-0 text-[0.55rem] tracking-[0.25em] uppercase px-2 py-1 border ${STATUS_STYLE[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs mb-4">
        <div>
          <dt className="text-cream/40 tracking-[0.2em] uppercase text-[0.55rem] mb-0.5">Ziel</dt>
          <dd className="text-cream/80">{target}</dd>
        </div>
        <div>
          <dt className="text-cream/40 tracking-[0.2em] uppercase text-[0.55rem] mb-0.5">Risiko</dt>
          <dd>
            <span className={`inline-block text-[0.55rem] tracking-[0.25em] uppercase px-2 py-0.5 border ${RISK_STYLE[risk]}`}>
              {RISK_LABEL[risk]}
            </span>
          </dd>
        </div>
      </dl>

      <div className="border-l-2 border-gold/40 pl-4 mb-4">
        <div className="text-[0.55rem] tracking-[0.25em] uppercase text-cream/40 mb-1">
          Vorgeschlagene Änderung
        </div>
        <pre className="text-sm text-cream/85 whitespace-pre-wrap font-light leading-relaxed font-sans">
          {change}
        </pre>
      </div>

      {status === "pending" ? (
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={onReject}
            className="text-[0.6rem] tracking-[0.28em] uppercase border border-border text-cream/60 px-4 py-2 hover:text-red-400 hover:border-red-500/40"
          >
            Ablehnen
          </button>
          <button
            onClick={onAccept}
            className="text-[0.6rem] tracking-[0.28em] uppercase border border-gold text-gold px-4 py-2 hover:bg-gold hover:text-onyx"
          >
            Annehmen (Mock)
          </button>
        </div>
      ) : (
        <div className="text-[0.6rem] tracking-[0.25em] uppercase text-cream/40 text-right">
          {status === "applied" ? "✓ Im Mock angewendet" : "✕ Abgelehnt"}
        </div>
      )}
    </div>
  );
}

function VehicleTable({ rows }: { rows: VehicleRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="w-full border border-border bg-jet/60 p-5 text-cream/60 text-sm">
        Keine Fahrzeuge in der Datenbank.
      </div>
    );
  }
  return (
    <div className="w-full border border-border bg-jet/60">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="text-[0.55rem] tracking-[0.3em] uppercase text-gold/70">
          Fahrzeuge · Nur-Lese · {rows.length}
        </div>
        <div className="text-[0.55rem] tracking-[0.25em] uppercase text-cream/40">
          Quelle: vehicles (Legacy DB)
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[0.55rem] tracking-[0.25em] uppercase text-cream/45 border-b border-border">
              <th className="text-left font-normal px-4 py-2.5">Name</th>
              <th className="text-left font-normal px-4 py-2.5">Kategorie</th>
              <th className="text-right font-normal px-4 py-2.5">Preis / Tag</th>
              <th className="text-left font-normal px-4 py-2.5">Status</th>
              <th className="text-left font-normal px-4 py-2.5">Beschreibung</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id} className="border-b border-border/40 last:border-0 align-top">
                <td className="px-4 py-3 text-cream font-light">{v.name}</td>
                <td className="px-4 py-3 text-cream/70">{v.category}</td>
                <td className="px-4 py-3 text-right text-gold font-light tabular-nums">
                  {formatPrice(Number(v.price_per_day))}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-[0.55rem] tracking-[0.25em] uppercase px-2 py-0.5 border ${
                      v.available
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : "bg-cream/5 text-cream/50 border-cream/20"
                    }`}
                  >
                    {v.available ? "Verfügbar" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-3 text-cream/60 font-light max-w-md">
                  {v.description ? (
                    <span className="line-clamp-2">{v.description}</span>
                  ) : (
                    <span className="text-cream/30">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
