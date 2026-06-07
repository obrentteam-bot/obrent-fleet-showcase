import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { supabase, formatPrice, type DbVehicle } from "@/lib/supabase";
import {
  CAPABILITY_MAP,
  NOT_EDITABLE_HINT,
  checkCapability,
  type AreaKey,
  type ActionKind,
} from "@/lib/ai-editor-capabilities";
import { logPrompt, updateLogStatus } from "@/lib/ai-editor-log";
import logo from "@/assets/obrent-logo.png";

// ---------------------------------------------------------------------------
// Types: Intent / Proposal architecture
// ---------------------------------------------------------------------------

type VehicleRow = Pick<
  DbVehicle,
  "id" | "name" | "category" | "price_per_day" | "available" | "description"
>;

type SettingsRow = {
  id: string;
  company_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: string | null;
};

export type Area =
  | "vehicles"
  | "website"
  | "settings"
  | "seo"
  | "translations"
  | "unknown";

export type IntentKind =
  | "read"            // list/show data
  | "create"          // add new entity
  | "update"          // modify existing entity (incl. price)
  | "delete"          // delete / deactivate
  | "optimize"        // rewrite copy / improve content
  | "translate"       // localize / translate
  | "settings_update" // change global settings
  | "seo_suggestion"  // metadata / search optimization
  | "unknown";

export type ProposalAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "optimize"
  | "translate";

export type ProposalStatus = "pending" | "applied" | "rejected" | "info";

export type Risk = "low" | "medium" | "high";

export type DetectedIntent = {
  kind: IntentKind;
  area: Area;
  action: ProposalAction | "none";
  confidence: number;        // 0..1
  target?: string;           // e.g. "Audi RS6"
  fields?: Record<string, string | number>; // e.g. { price_per_day: 499 }
  raw: string;
};

type BaseProposal = {
  id: string;
  area: Area;
  summary: string;
  target: string;
  risk: Risk;
  status: ProposalStatus;
  rationale?: string;
};

export type Proposal =
  | (BaseProposal & { action: "create"; payload: Record<string, string | number | boolean> })
  | (BaseProposal & { action: "update"; payload: { field: string; from?: string | number; to: string | number } })
  | (BaseProposal & { action: "delete"; payload: { mode: "delete" | "deactivate" } })
  | (BaseProposal & { action: "optimize"; payload: { current?: string; suggestion: string } })
  | (BaseProposal & { action: "translate"; payload: { language: string; key?: string; suggestion: string } })
  | (BaseProposal & { action: "read"; payload: { resource: string } });

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: DetectedIntent;
  proposals?: Proposal[];
  vehicles?: VehicleRow[];
  vehiclesError?: string;
  settings?: SettingsRow;
  settingsError?: string;
  capabilityNotice?: { areaLabel: string; message: string };
  logId?: string | null;
  logError?: string | null;
  ts: number;
};

// ---------------------------------------------------------------------------
// Constants / Labels
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/admin/ai-editor")({
  head: () => ({
    meta: [
      { title: "AI Editor — OBRENT Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AiEditorPage,
});

const AREA_LABEL: Record<Area, string> = {
  vehicles: "Fahrzeuge",
  website: "Website",
  settings: "Einstellungen",
  seo: "SEO",
  translations: "Übersetzungen",
  unknown: "Unbekannt",
};

const INTENT_LABEL: Record<IntentKind, string> = {
  read: "Lesen",
  create: "Anlegen",
  update: "Aktualisieren",
  delete: "Löschen / Deaktivieren",
  optimize: "Optimieren",
  translate: "Übersetzen",
  settings_update: "Einstellung ändern",
  seo_suggestion: "SEO-Vorschlag",
  unknown: "Unklar",
};

const ACTION_LABEL: Record<ProposalAction, string> = {
  read: "Lesen",
  create: "Anlegen",
  update: "Aktualisieren",
  delete: "Löschen",
  optimize: "Optimieren",
  translate: "Übersetzen",
};

const RISK_STYLE: Record<Risk, string> = {
  low: "bg-green-500/10 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/10 text-red-400 border-red-500/30",
};
const RISK_LABEL: Record<Risk, string> = { low: "Niedrig", medium: "Mittel", high: "Hoch" };

const STATUS_STYLE: Record<ProposalStatus, string> = {
  pending: "bg-cream/5 text-cream/70 border-cream/20",
  applied: "bg-gold/10 text-gold border-gold/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  info: "bg-cream/5 text-cream/60 border-cream/20",
};
const STATUS_LABEL: Record<ProposalStatus, string> = {
  pending: "Vorschlag",
  applied: "Angewendet",
  rejected: "Abgelehnt",
  info: "Information",
};

const ACTION_ACCENT: Record<ProposalAction, string> = {
  read: "border-cream/30",
  create: "border-green-500/40",
  update: "border-gold/50",
  delete: "border-red-500/50",
  optimize: "border-blue-400/40",
  translate: "border-purple-400/40",
};

const SUGGESTIONS: string[] = [
  "Fahrzeuge anzeigen",
  "Preis ändern",
  "Fahrzeug hinzufügen",
  "Fahrzeug deaktivieren",
  "SEO prüfen",
  "Text optimieren",
  "Einstellungen ändern",
];

// ---------------------------------------------------------------------------
// Intent detection
// ---------------------------------------------------------------------------

function detectArea(p: string): Area {
  if (/(fahrzeug|auto|wagen|modell|audi|bmw|mercedes|ferrari|porsche|lamborghini|rs\d|g-klasse|tagespreis|preis|€|eur)/.test(p)) return "vehicles";
  if (/(seo|meta|description|titel|og:|sitemap|keyword)/.test(p)) return "seo";
  if (/(übersetz|uebersetz|translate|englisch|english|französisch|franzoesisch|i18n|sprache)/.test(p)) return "translations";
  if (/(einstellung|telefon|adresse|öffnungszeit|oeffnungszeit|kontakt|impressum|email|e-mail)/.test(p)) return "settings";
  if (/(startseite|hero|seite|website|landing|sektion|über uns|ueber uns)/.test(p)) return "website";
  return "unknown";
}

function extractPrice(p: string): number | undefined {
  const m = p.match(/(\d{2,5})\s*(?:€|eur|euro)/i) ?? p.match(/auf\s+(\d{2,5})/i);
  return m ? Number(m[1]) : undefined;
}

function extractTarget(p: string): string | undefined {
  // Best-effort: capture a capitalized model token after keywords or in quotes.
  const quoted = p.match(/["„»]([^"“«»]{2,60})["“«»]/);
  if (quoted) return quoted[1].trim();
  const after = p.match(/(?:fahrzeug|auto|modell|den|die|das|the)\s+([A-Z][\w\- ]{1,40}?)(?:\s+(?:auf|hinzu|löschen|loeschen|deaktivieren|aktualisieren|ändern|aendern|optimieren)|[.,!?]|$)/);
  if (after) return after[1].trim();
  // Last resort: longest run of Capitalized words
  const cap = p.match(/[A-ZÄÖÜ][\wÄÖÜäöüß]+(?:\s+[A-Z0-9][\wÄÖÜäöüß0-9]+){0,4}/);
  return cap ? cap[0].trim() : undefined;
}

function detectIntent(raw: string): DetectedIntent {
  const p = raw.toLowerCase();
  let area = detectArea(p);
  let kind: IntentKind = "unknown";
  let action: ProposalAction | "none" = "none";
  let confidence = 0.4;
  const fields: Record<string, string | number> = {};

  const isDelete = /(lösch|loesch|entfern|deaktivier|archivier|delete|remove)/.test(p);
  const isCreate = /(hinzufüg|hinzufueg|neu anleg|anlegen|erstell|add|füge.*hinzu|fuege.*hinzu|create)/.test(p);
  const isList = /(zeig|liste|alle|übersicht|uebersicht|anzeigen|show|display|welche|gib mir|list)/.test(p);
  const isOptimize = /(optimier|verbesser|vorschlag|umschreib|verfeiner|kürzen|kuerzen|prüf|pruef|check|improve)/.test(p);
  const isTranslate = /(übersetz|uebersetz|translate|englisch|english|französisch|franzoesisch|spanisch)/.test(p);
  const priceVal = extractPrice(p);
  const isPriceUpdate = priceVal !== undefined && /(preis|€|eur|euro|pro tag|tagespreis|auf\s+\d)/.test(p);
  const isGenericUpdate = /(ändere|aendere|update|anpassen|setze|change|aktualisier|umstellen)/.test(p);

  if (isDelete) {
    kind = "delete"; action = "delete"; confidence = 0.85;
  } else if (isCreate) {
    kind = "create"; action = "create"; confidence = 0.8;
  } else if (isPriceUpdate) {
    kind = "update"; action = "update"; confidence = 0.9;
    fields.price_per_day = priceVal!;
    area = "vehicles";
  } else if (isTranslate && area !== "vehicles") {
    kind = "translate"; action = "translate"; confidence = 0.75;
    area = "translations";
  } else if (isOptimize && area === "seo") {
    kind = "seo_suggestion"; action = "optimize"; confidence = 0.8;
  } else if (isOptimize) {
    kind = "optimize"; action = "optimize"; confidence = 0.75;
  } else if (area === "settings" && isGenericUpdate) {
    kind = "settings_update"; action = "update"; confidence = 0.8;
  } else if (isGenericUpdate) {
    kind = "update"; action = "update"; confidence = 0.7;
  } else if (isList) {
    kind = "read"; action = "read"; confidence = 0.85;
  }

  // If user clearly asked for a price update, normalize area.
  if (kind === "update" && fields.price_per_day !== undefined) area = "vehicles";
  // Defaults for unknown area on actionable intents:
  if (kind === "create" && area === "unknown") area = "vehicles";

  const target = extractTarget(raw);

  return {
    kind,
    area,
    action,
    confidence,
    target,
    fields: Object.keys(fields).length ? fields : undefined,
    raw,
  };
}

// ---------------------------------------------------------------------------
// Area ↔ Capability mapping
// ---------------------------------------------------------------------------

/** Map the chat-side `Area` to a capability-map `AreaKey` (or null). */
function toCapabilityKey(area: Area): AreaKey | null {
  switch (area) {
    case "vehicles":     return "vehicles";
    case "settings":     return "app_settings";
    case "website":      return "website_copy";
    case "seo":          return "seo";
    case "translations": return "translations";
    case "unknown":      return null;
  }
}

function intentToActionKind(kind: IntentKind): ActionKind | null {
  switch (kind) {
    case "read":             return "read";
    case "create":           return "create";
    case "update":
    case "settings_update":  return "update";
    case "delete":           return "delete";
    // Pure content ops are advisory in the mock — treat as "update" gate.
    case "optimize":
    case "seo_suggestion":
    case "translate":        return "update";
    case "unknown":          return null;
  }
}

// ---------------------------------------------------------------------------
// Proposal building (mock — no writes)
// ---------------------------------------------------------------------------



function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildProposal(intent: DetectedIntent): Proposal | null {
  const { kind, area, target, fields, raw } = intent;
  const base = { id: newId(), area, status: "pending" as ProposalStatus };

  switch (kind) {
    case "create":
      return {
        ...base,
        action: "create",
        summary: area === "vehicles" ? `Neues Fahrzeug anlegen${target ? `: ${target}` : ""}` : `Neuen Eintrag anlegen`,
        target: area === "vehicles" ? `vehicles · ${target ?? "(unbenannt)"}` : `${AREA_LABEL[area]} · (Eintrag)`,
        risk: "high",
        payload: { name: target ?? "(unbekannt)", category: "(fehlt)", price_per_day: 0, available: true },
        rationale: `Aus Eingabe: "${raw}"`,
      };

    case "update": {
      if (fields?.price_per_day !== undefined) {
        return {
          ...base,
          action: "update",
          summary: `Tagespreis aktualisieren${target ? ` für ${target}` : ""}`,
          target: `vehicles · ${target ?? "(Fahrzeug?)"} · price_per_day`,
          risk: "medium",
          payload: { field: "price_per_day", to: fields.price_per_day },
          rationale: `Aus Eingabe: "${raw}"`,
        };
      }
      return {
        ...base,
        action: "update",
        summary: `Eintrag aktualisieren${target ? `: ${target}` : ""}`,
        target: `${AREA_LABEL[area]} · ${target ?? "(Ziel?)"}`,
        risk: "medium",
        payload: { field: "(unbestimmt)", to: "(unbestimmt)" },
        rationale: `Aus Eingabe: "${raw}"`,
      };
    }

    case "delete":
      return {
        ...base,
        action: "delete",
        summary: `Eintrag deaktivieren${target ? `: ${target}` : ""}`,
        target: area === "vehicles" ? `vehicles · ${target ?? "(Fahrzeug?)"}` : `${AREA_LABEL[area]} · ${target ?? "(Ziel?)"}`,
        risk: "high",
        payload: { mode: "deactivate" },
        rationale: `Aus Eingabe: "${raw}"`,
      };

    case "optimize":
      return {
        ...base,
        action: "optimize",
        summary: `Text in ${AREA_LABEL[area]} optimieren`,
        target: `${AREA_LABEL[area]} · ${target ?? "(Sektion?)"}`,
        risk: "low",
        payload: { suggestion: "Klarere, nutzenorientierte Formulierung mit aktivem Satzbau." },
        rationale: `Aus Eingabe: "${raw}"`,
      };

    case "seo_suggestion":
      return {
        ...base,
        action: "optimize",
        summary: `SEO-Metadaten überarbeiten`,
        target: `seo · ${target ?? "(Seite?)"}`,
        risk: "low",
        payload: { suggestion: "Title < 60 Zeichen, Description < 160 Zeichen, OG-Bild & Canonical prüfen." },
        rationale: `Aus Eingabe: "${raw}"`,
      };

    case "translate":
      return {
        ...base,
        action: "translate",
        summary: `Übersetzung vorbereiten`,
        target: `i18n · ${target ?? "(Key?)"}`,
        risk: "low",
        payload: { language: "en", suggestion: "(Übersetzung wird generiert, sobald AI angebunden ist.)" },
        rationale: `Aus Eingabe: "${raw}"`,
      };

    case "settings_update":
      return {
        ...base,
        action: "update",
        summary: `Globale Einstellung ändern`,
        target: `settings · ${target ?? "(Feld?)"}`,
        risk: "medium",
        payload: { field: "(unbestimmt)", to: "(unbestimmt)" },
        rationale: `Aus Eingabe: "${raw}"`,
      };

    case "read":
    case "unknown":
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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
        "Willkommen im AI Editor. Schreib einfach, was du ändern möchtest — z. B. \"Zeig mir alle Fahrzeuge und Preise\", \"Ändere den Audi RS6 auf 499 € pro Tag\", \"Füge einen Ferrari 812 Superfast hinzu\" oder \"Deaktiviere die Mercedes G-Klasse\". Ich erkenne Bereich und Absicht automatisch. (Mock-Modus: keine Änderungen werden gespeichert.)",
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

    const intent = detectIntent(text);
    const replyId = `a-${Date.now()}`;
    const header = `Bereich: ${AREA_LABEL[intent.area]} · Intent: ${INTENT_LABEL[intent.kind]}${intent.target ? ` · Ziel: ${intent.target}` : ""}`;

    // READ → real legacy Supabase fetch for vehicles
    if (intent.kind === "read" && intent.area === "vehicles") {
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
              content: `${header}\nKonnte die Fahrzeuge nicht laden: ${error.message}`,
              intent,
              vehiclesError: error.message,
            }
          : {
              id: replyId,
              role: "assistant",
              ts: Date.now(),
              content: `${header}\n${data?.length ?? 0} Einträge geladen (nur Lese-Zugriff).`,
              intent,
              vehicles: (data ?? []) as VehicleRow[],
            },
      ]);
      setSending(false);
      return;
    }

    // READ → real legacy Supabase fetch for app_settings
    if (intent.kind === "read" && intent.area === "settings") {
      const { data, error } = await supabase
        .from("app_settings")
        .select("id, company_name, address, phone, email, hours")
        .limit(1)
        .maybeSingle();

      setMessages((m) => [
        ...m,
        error
          ? {
              id: replyId,
              role: "assistant",
              ts: Date.now(),
              content: `${header}\nKonnte die Einstellungen nicht laden: ${error.message}`,
              intent,
              settingsError: error.message,
            }
          : {
              id: replyId,
              role: "assistant",
              ts: Date.now(),
              content: `${header}\n${data ? "Einstellungen geladen (nur Lese-Zugriff)." : "Keine Einstellungen gefunden."}`,
              intent,
              settings: (data ?? undefined) as SettingsRow | undefined,
            },
      ]);
      setSending(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 500));

    if (intent.kind === "unknown") {
      setMessages((m) => [
        ...m,
        {
          id: replyId,
          role: "assistant",
          ts: Date.now(),
          content:
            `${header}\nIch konnte keine klare Absicht erkennen.\n\nBeispiele:\n· "Zeig mir alle Fahrzeuge und Preise"\n· "Füge einen Ferrari 812 Superfast hinzu"\n· "Ändere den Audi RS6 auf 499 € pro Tag"\n· "Deaktiviere die Mercedes G-Klasse"\n· "Optimiere die Startseite für SEO"`,
          intent,
        },
      ]);
      setSending(false);
      return;
    }

    // Capability gate: consult the central map before proposing anything.
    const capKey = toCapabilityKey(intent.area);
    const actionKind = intentToActionKind(intent.kind);
    const field =
      intent.fields?.price_per_day !== undefined ? "price_per_day" : undefined;
    const check =
      capKey && actionKind
        ? checkCapability(capKey, actionKind, field)
        : null;

    let proposal = buildProposal(intent);
    let extraContent = "";
    let notice: ChatMessage["capabilityNotice"];

    if (!check || !check.allowed) {
      const areaLabel = capKey ? CAPABILITY_MAP[capKey].label : AREA_LABEL[intent.area];
      const reason = check?.reason ?? NOT_EDITABLE_HINT;
      notice = { areaLabel, message: reason };
      extraContent = `\n${reason}`;
      // Downgrade any proposal to advisory-only.
      if (proposal) proposal = { ...proposal, status: "info", risk: "low" };
    } else if (check.needsConfirmation && proposal) {
      proposal = {
        ...proposal,
        risk: "high",
        rationale:
          (proposal.rationale ? proposal.rationale + " · " : "") +
          `Feld "${field}" gilt als kritisch — zusätzliche Bestätigung erforderlich.`,
      };
      extraContent = `\nFeld "${field}" ist als kritisch markiert (zusätzliche Bestätigung nötig).`;
    }

    setMessages((m) => [
      ...m,
      {
        id: replyId,
        role: "assistant",
        ts: Date.now(),
        content:
          `${header}\n${proposal ? "Vorschlag erstellt (Mock — wird nicht angewendet)." : "Kein Vorschlag erzeugt."}${extraContent}`,
        intent,
        proposals: proposal ? [proposal] : undefined,
        capabilityNotice: notice,
      },
    ]);
    setSending(false);
  };


  const updateProposalStatus = (msgId: string, propId: string, status: ProposalStatus) => {
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
          <div className="eyebrow mb-2">Admin Copilot</div>
          <div className="font-display text-2xl text-cream">Was möchtest du ändern?</div>
          <p className="text-cream/55 text-sm mt-1">
            Schreib natürlich — ich erkenne Bereich (Fahrzeuge, Website, Einstellungen, SEO, Übersetzungen) und Intent (Lesen, Anlegen, Aktualisieren, Löschen, Optimieren, Übersetzen) automatisch.
          </p>
        </div>

        <div
          ref={scrollerRef}
          className="flex-1 border border-border bg-jet/30 p-5 md:p-7 overflow-y-auto space-y-6 min-h-[420px]"
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} onProposalAction={updateProposalStatus} />
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
            placeholder='z. B. "Ändere den Audi RS6 auf 499 € pro Tag" (⌘/Ctrl + Enter zum Senden)'
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

// ---------------------------------------------------------------------------
// Chat bubble + proposal renderer
// ---------------------------------------------------------------------------

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
      <div className={`${msg.vehicles || msg.settings ? "max-w-full w-full" : "max-w-[85%]"} ${isUser ? "items-end" : "items-start"} flex flex-col gap-3`}>
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

        {msg.intent && !isUser && <IntentBadge intent={msg.intent} />}
        {msg.capabilityNotice && <CapabilityNotice notice={msg.capabilityNotice} />}
        {msg.vehicles && <VehicleTable rows={msg.vehicles} />}
        {msg.settings && <SettingsCard row={msg.settings} />}

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

function CapabilityNotice({
  notice,
}: {
  notice: NonNullable<ChatMessage["capabilityNotice"]>;
}) {
  return (
    <div className="w-full border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
      <div className="text-[0.55rem] tracking-[0.3em] uppercase text-yellow-300/80 mb-1">
        Capability · {notice.areaLabel}
      </div>
      <div className="text-sm text-cream/85 leading-relaxed">{notice.message}</div>
    </div>
  );
}

function SettingsCard({ row }: { row: SettingsRow }) {
  const cap = CAPABILITY_MAP.app_settings;
  const entries: Array<[string, string | null]> = [
    ["company_name", row.company_name],
    ["address", row.address],
    ["phone", row.phone],
    ["email", row.email],
    ["hours", row.hours],
  ];
  return (
    <div className="w-full border border-border bg-jet/60">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="text-[0.55rem] tracking-[0.3em] uppercase text-gold/70">
          Einstellungen · Nur-Lese
        </div>
        <div className="text-[0.55rem] tracking-[0.25em] uppercase text-cream/40">
          Quelle: app_settings (Legacy DB)
        </div>
      </div>
      <dl className="divide-y divide-border/40">
        {entries.map(([key, val]) => {
          const risky = cap.riskyFields.includes(key);
          return (
            <div key={key} className="grid grid-cols-[180px_1fr] gap-4 px-5 py-3">
              <dt className="text-[0.6rem] tracking-[0.25em] uppercase text-cream/45 flex items-center gap-2">
                {key}
                {risky && (
                  <span className="text-[0.5rem] tracking-[0.2em] uppercase border border-yellow-500/40 text-yellow-300/80 px-1.5 py-0.5">
                    kritisch
                  </span>
                )}
              </dt>
              <dd className="text-sm text-cream/85 font-light">
                {val ? val : <span className="text-cream/30">—</span>}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function IntentBadge({ intent }: { intent: DetectedIntent }) {
  const conf = Math.round(intent.confidence * 100);
  return (
    <div className="flex flex-wrap gap-2 text-[0.55rem] tracking-[0.25em] uppercase">
      <span className="border border-border px-2 py-1 text-cream/55">
        Area · {AREA_LABEL[intent.area]}
      </span>
      <span className="border border-gold/30 px-2 py-1 text-gold/80">
        Intent · {INTENT_LABEL[intent.kind]}
      </span>
      {intent.target && (
        <span className="border border-border px-2 py-1 text-cream/55">
          Ziel · {intent.target}
        </span>
      )}
      <span className="border border-border px-2 py-1 text-cream/45">
        Konfidenz · {conf}%
      </span>
    </div>
  );
}

// --- Proposal cards (per action) ---

function ProposalCard({
  proposal,
  onAccept,
  onReject,
}: {
  proposal: Proposal;
  onAccept: () => void;
  onReject: () => void;
}) {
  switch (proposal.action) {
    case "create":   return <CreateCard p={proposal} onAccept={onAccept} onReject={onReject} />;
    case "update":   return <UpdateCard p={proposal} onAccept={onAccept} onReject={onReject} />;
    case "delete":   return <DeleteCard p={proposal} onAccept={onAccept} onReject={onReject} />;
    case "optimize": return <OptimizeCard p={proposal} onAccept={onAccept} onReject={onReject} />;
    case "translate":return <TranslateCard p={proposal} onAccept={onAccept} onReject={onReject} />;
    case "read":     return <ReadCard p={proposal} />;
  }
}

function CardShell({
  p, onAccept, onReject, children, destructive = false,
}: {
  p: Proposal;
  onAccept?: () => void;
  onReject?: () => void;
  children: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div className={`w-full border bg-jet/60 p-5 ${ACTION_ACCENT[p.action]}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-1">
            Vorschlag · {ACTION_LABEL[p.action]} · {AREA_LABEL[p.area]}
          </div>
          <div className="font-display text-lg text-cream leading-snug">{p.summary}</div>
        </div>
        <span className={`shrink-0 text-[0.55rem] tracking-[0.25em] uppercase px-2 py-1 border ${STATUS_STYLE[p.status]}`}>
          {STATUS_LABEL[p.status]}
        </span>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs mb-4">
        <div>
          <dt className="text-cream/40 tracking-[0.2em] uppercase text-[0.55rem] mb-0.5">Ziel</dt>
          <dd className="text-cream/80">{p.target}</dd>
        </div>
        <div>
          <dt className="text-cream/40 tracking-[0.2em] uppercase text-[0.55rem] mb-0.5">Risiko</dt>
          <dd>
            <span className={`inline-block text-[0.55rem] tracking-[0.25em] uppercase px-2 py-0.5 border ${RISK_STYLE[p.risk]}`}>
              {RISK_LABEL[p.risk]}
            </span>
          </dd>
        </div>
      </dl>

      <div className="border-l-2 border-gold/40 pl-4 mb-4">
        {children}
      </div>

      {p.rationale && (
        <div className="text-[0.6rem] tracking-[0.2em] uppercase text-cream/35 mb-3">
          {p.rationale}
        </div>
      )}

      {onAccept && onReject && (p.status === "pending" ? (
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={onReject}
            className="text-[0.6rem] tracking-[0.28em] uppercase border border-border text-cream/60 px-4 py-2 hover:text-red-400 hover:border-red-500/40"
          >
            Ablehnen
          </button>
          <button
            onClick={onAccept}
            className={`text-[0.6rem] tracking-[0.28em] uppercase px-4 py-2 border ${
              destructive
                ? "border-red-500/60 text-red-400 hover:bg-red-500/10"
                : "border-gold text-gold hover:bg-gold hover:text-onyx"
            }`}
          >
            {destructive ? "Bestätigen (Mock)" : "Annehmen (Mock)"}
          </button>
        </div>
      ) : (
        <div className="text-[0.6rem] tracking-[0.25em] uppercase text-cream/40 text-right">
          {p.status === "applied"
            ? "✓ Im Mock angewendet"
            : p.status === "rejected"
            ? "✕ Abgelehnt"
            : "ℹ Nur Vorschlag — Bereich nicht direkt bearbeitbar"}
        </div>
      ))}

    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[0.55rem] tracking-[0.25em] uppercase text-cream/40 mb-1">{children}</div>;
}

function CreateCard({ p, onAccept, onReject }: { p: Extract<Proposal, { action: "create" }>; onAccept: () => void; onReject: () => void; }) {
  return (
    <CardShell p={p} onAccept={onAccept} onReject={onReject}>
      <Label>Neuer Eintrag</Label>
      <pre className="text-sm text-cream/85 whitespace-pre-wrap font-light leading-relaxed font-sans">
        {JSON.stringify(p.payload, null, 2)}
      </pre>
    </CardShell>
  );
}

function UpdateCard({ p, onAccept, onReject }: { p: Extract<Proposal, { action: "update" }>; onAccept: () => void; onReject: () => void; }) {
  return (
    <CardShell p={p} onAccept={onAccept} onReject={onReject}>
      <Label>Feldänderung</Label>
      <div className="text-sm text-cream/85 font-light leading-relaxed">
        <span className="text-cream/55">{p.payload.field}</span>{" "}
        {p.payload.from !== undefined && (
          <>
            <span className="text-cream/40">von</span>{" "}
            <span className="text-cream/80">{String(p.payload.from)}</span>{" "}
          </>
        )}
        <span className="text-cream/40">→</span>{" "}
        <span className="text-gold">{String(p.payload.to)}</span>
      </div>
    </CardShell>
  );
}

function DeleteCard({ p, onAccept, onReject }: { p: Extract<Proposal, { action: "delete" }>; onAccept: () => void; onReject: () => void; }) {
  return (
    <CardShell p={p} onAccept={onAccept} onReject={onReject} destructive>
      <Label>Destruktive Aktion</Label>
      <div className="text-sm text-red-300/90 font-light leading-relaxed">
        Modus: <span className="uppercase tracking-wider">{p.payload.mode}</span> — der Eintrag wird {p.payload.mode === "delete" ? "endgültig entfernt" : "deaktiviert (Soft-Delete)"}.
      </div>
    </CardShell>
  );
}

function OptimizeCard({ p, onAccept, onReject }: { p: Extract<Proposal, { action: "optimize" }>; onAccept: () => void; onReject: () => void; }) {
  return (
    <CardShell p={p} onAccept={onAccept} onReject={onReject}>
      {p.payload.current && (
        <>
          <Label>Aktuell</Label>
          <pre className="text-sm text-cream/65 whitespace-pre-wrap font-light leading-relaxed font-sans mb-3">{p.payload.current}</pre>
        </>
      )}
      <Label>Vorschlag</Label>
      <pre className="text-sm text-cream/85 whitespace-pre-wrap font-light leading-relaxed font-sans">{p.payload.suggestion}</pre>
    </CardShell>
  );
}

function TranslateCard({ p, onAccept, onReject }: { p: Extract<Proposal, { action: "translate" }>; onAccept: () => void; onReject: () => void; }) {
  return (
    <CardShell p={p} onAccept={onAccept} onReject={onReject}>
      <Label>Sprache · {p.payload.language.toUpperCase()}{p.payload.key ? ` · ${p.payload.key}` : ""}</Label>
      <pre className="text-sm text-cream/85 whitespace-pre-wrap font-light leading-relaxed font-sans">{p.payload.suggestion}</pre>
    </CardShell>
  );
}

function ReadCard({ p }: { p: Extract<Proposal, { action: "read" }>; }) {
  return (
    <CardShell p={p}>
      <Label>Ressource</Label>
      <div className="text-sm text-cream/85 font-light leading-relaxed">{p.payload.resource}</div>
    </CardShell>
  );
}

// ---------------------------------------------------------------------------
// Vehicle table (real legacy data)
// ---------------------------------------------------------------------------

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
