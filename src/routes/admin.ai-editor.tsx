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

type TabKey = "website" | "fahrzeuge" | "einstellungen" | "seo" | "uebersetzungen";

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "website", label: "Website", hint: "Hero-Texte, Sektionen, Kontaktdaten anpassen." },
  { key: "fahrzeuge", label: "Fahrzeuge", hint: "Fahrzeug-Beschreibungen oder Preise vorschlagen." },
  { key: "einstellungen", label: "Einstellungen", hint: "Globale Einstellungen, Öffnungszeiten, Kontakt." },
  { key: "seo", label: "SEO", hint: "Meta-Titel, Descriptions, OG-Tags optimieren." },
  { key: "uebersetzungen", label: "Übersetzungen", hint: "DE/EN/FR Strings anpassen oder ergänzen." },
];

type Risk = "low" | "medium" | "high";
type ProposalStatus = "pending" | "applied" | "rejected";
type ProposalType = "copy" | "price" | "metadata" | "translation" | "setting";

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

function mockReply(tab: TabKey, prompt: string): { content: string; proposals: Proposal[] } {
  const base = Date.now();
  const make = (i: number): Proposal => {
    const map: Record<TabKey, Proposal> = {
      website: {
        id: `${base}-${i}`,
        summary: "Hero-Headline klarer und nutzenorientiert formulieren",
        target: "Startseite · Hero · Headline",
        type: "copy",
        change:
          'Aktuell: "Luxusfahrzeuge mieten."\nNeu: "Luxus auf Abruf — Premium-Fahrzeuge in Frankfurt mieten."',
        risk: "low",
        status: "pending",
      },
      fahrzeuge: {
        id: `${base}-${i}`,
        summary: "Beschreibung für Mercedes G-Klasse verfeinern",
        target: "Fahrzeug · Mercedes G-Klasse",
        type: "copy",
        change:
          "Beschreibung um Ausstattungsmerkmale (Burmester, AMG Line, 360°-Kamera) ergänzen.",
        risk: "low",
        status: "pending",
      },
      einstellungen: {
        id: `${base}-${i}`,
        summary: "Öffnungszeiten Sonntag aktualisieren",
        target: "Einstellungen · Öffnungszeiten",
        type: "setting",
        change: "So: geschlossen → 10:00–16:00 (nach Vereinbarung).",
        risk: "medium",
        status: "pending",
      },
      seo: {
        id: `${base}-${i}`,
        summary: "Meta-Description Startseite kürzen auf < 160 Zeichen",
        target: "SEO · / · meta description",
        type: "metadata",
        change:
          'Neu: "OBRENT — Premium- und Luxusfahrzeuge mieten in Frankfurt. Tageweise, mit Lieferung, ohne Kompromisse."',
        risk: "low",
        status: "pending",
      },
      uebersetzungen: {
        id: `${base}-${i}`,
        summary: 'EN-Übersetzung für "Jetzt anfragen" angleichen',
        target: "i18n · en · cta.book_now",
        type: "translation",
        change: '"Book now" → "Request a quote"',
        risk: "low",
        status: "pending",
      },
    };
    return map[tab];
  };

  return {
    content: `Ich habe deinen Wunsch verstanden:\n\n"${prompt}"\n\nHier sind meine Vorschläge für den Bereich ${TABS.find((t) => t.key === tab)?.label}. Du kannst sie einzeln annehmen oder ablehnen.`,
    proposals: [make(1), make(2)].map((p, idx) => ({ ...p, id: `${p.id}-${idx}` })),
  };
}

function AiEditorPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();

  const [tab, setTab] = useState<TabKey>("website");
  const [prompt, setPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      ts: Date.now(),
      content:
        "Willkommen im AI Editor. Wähle oben einen Bereich, beschreibe was du ändern möchtest — ich erstelle Vorschläge, die du prüfen kannst. (Mock-Modus: keine Änderungen werden gespeichert.)",
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

  const send = () => {
    const text = prompt.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setSending(true);

    setTimeout(() => {
      const { content, proposals } = mockReply(tab, text);
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", content, proposals, ts: Date.now() },
      ]);
      setSending(false);
    }, 900);
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

  const activeTab = TABS.find((t) => t.key === tab)!;

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

      {/* Tabs */}
      <nav className="border-b border-border px-6 md:px-12 py-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-[0.65rem] tracking-[0.28em] uppercase px-4 py-2 border transition-colors ${
                active
                  ? "border-gold text-gold bg-gold/5"
                  : "border-border text-cream/60 hover:text-cream hover:border-cream/30"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 px-6 md:px-12 py-8 max-w-5xl w-full mx-auto flex flex-col min-h-0">
        <div className="mb-6">
          <div className="eyebrow mb-2">Aktiver Bereich</div>
          <div className="font-display text-2xl text-cream">{activeTab.label}</div>
          <p className="text-cream/55 text-sm mt-1">{activeTab.hint}</p>
        </div>

        {/* Chat history */}
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

        {/* Prompt */}
        <div className="mt-5 border border-border bg-jet/40 p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                send();
              }
            }}
            rows={3}
            placeholder={`Was möchtest du im Bereich ${activeTab.label} ändern? (⌘/Ctrl + Enter zum Senden)`}
            className="w-full bg-transparent text-cream placeholder:text-cream/30 text-sm font-light leading-relaxed resize-none focus:outline-none"
          />
          <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-border/60">
            <span className="text-[0.6rem] tracking-[0.28em] uppercase text-cream/40">
              Keine Änderungen werden gespeichert
            </span>
            <button
              onClick={send}
              disabled={sending || !prompt.trim()}
              className="text-[0.65rem] tracking-[0.28em] uppercase border border-gold text-gold px-5 py-2 hover:bg-gold hover:text-onyx transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gold"
            >
              {sending ? "Sende…" : "Senden →"}
            </button>
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
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-3`}>
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
