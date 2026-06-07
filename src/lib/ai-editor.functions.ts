// Server-side AI proposal generation for the AI Editor.
// - Runs only on the server (createServerFn).
// - Gated by requireAdmin (legacy Supabase auth + has_role(admin)).
// - Calls the Lovable AI Gateway (LOVABLE_API_KEY) for structured JSON output.
// - Respects the capability map (no writes, proposals only).
// - Logs every prompt + AI response into ai_editor_logs.

import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase as legacySupabaseBrowser } from "@/lib/supabase";
import {
  CAPABILITY_MAP,
  NOT_EDITABLE_HINT,
  type AreaKey,
  type ActionKind,
} from "@/lib/ai-editor-capabilities";

// ---------- Shared shape (mirrors the client Proposal union) ----------

export type SrvArea =
  | "vehicles"
  | "website"
  | "settings"
  | "seo"
  | "translations"
  | "unknown";

export type SrvIntentKind =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "optimize"
  | "translate"
  | "settings_update"
  | "seo_suggestion"
  | "unknown";

export type SrvProposalAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "optimize"
  | "translate";

export type SrvRisk = "low" | "medium" | "high";
export type SrvProposalStatus = "pending" | "applied" | "rejected" | "info";

export type SrvIntent = {
  kind: SrvIntentKind;
  area: SrvArea;
  action: SrvProposalAction | "none";
  confidence: number;
  target?: string;
  fields?: Record<string, string | number>;
  raw: string;
};

type SrvBaseProposal = {
  id: string;
  area: SrvArea;
  summary: string;
  target: string;
  risk: SrvRisk;
  status: SrvProposalStatus;
  rationale?: string;
};

export type SrvProposal =
  | (SrvBaseProposal & {
      action: "create";
      payload: Record<string, string | number | boolean>;
    })
  | (SrvBaseProposal & {
      action: "update";
      payload: { field: string; from?: string | number; to: string | number };
    })
  | (SrvBaseProposal & {
      action: "delete";
      payload: { mode: "delete" | "deactivate" };
    })
  | (SrvBaseProposal & {
      action: "optimize";
      payload: { current?: string; suggestion: string };
    })
  | (SrvBaseProposal & {
      action: "translate";
      payload: { language: string; key?: string; suggestion: string };
    });

export type GenerateProposalResult = {
  intent: SrvIntent;
  proposal: SrvProposal | null;
  capabilityNotice: { areaLabel: string; message: string } | null;
  message: string;
  logId: string | null;
  logError: string | null;
};

// ---------- Client middleware: attach legacy Supabase bearer ----------
// The global attachSupabaseAuth in src/start.ts pulls from the Cloud client
// (which has no session here). This local attacher pulls from the legacy
// browser client used for admin sign-in.
const attachLegacyAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await legacySupabaseBrowser.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);

// ---------- Capability helpers (server copy) ----------

function toCapabilityKey(area: SrvArea): AreaKey | null {
  switch (area) {
    case "vehicles":
      return "vehicles";
    case "settings":
      return "app_settings";
    case "website":
      return "website_copy";
    case "seo":
      return "seo";
    case "translations":
      return "translations";
    case "unknown":
      return null;
  }
}

function intentToActionKind(kind: SrvIntentKind): ActionKind | null {
  switch (kind) {
    case "read":
      return "read";
    case "create":
      return "create";
    case "update":
    case "settings_update":
      return "update";
    case "delete":
      return "delete";
    case "optimize":
    case "seo_suggestion":
    case "translate":
      return "update";
    case "unknown":
      return null;
  }
}

const AREA_LABEL_SRV: Record<SrvArea, string> = {
  vehicles: "Fahrzeuge",
  website: "Website",
  settings: "Einstellungen",
  seo: "SEO",
  translations: "Übersetzungen",
  unknown: "Unbekannt",
};

// ---------- AI Gateway call (tool calling for structured output) ----------

const AI_TOOL = {
  type: "function" as const,
  function: {
    name: "create_proposal",
    description:
      "Erstelle einen strukturierten Änderungsvorschlag basierend auf der Admin-Anweisung.",
    parameters: {
      type: "object",
      properties: {
        intentKind: {
          type: "string",
          enum: [
            "read",
            "create",
            "update",
            "delete",
            "optimize",
            "translate",
            "settings_update",
            "seo_suggestion",
            "unknown",
          ],
        },
        area: {
          type: "string",
          enum: [
            "vehicles",
            "website",
            "settings",
            "seo",
            "translations",
            "unknown",
          ],
        },
        action: {
          type: "string",
          enum: ["create", "update", "delete", "optimize", "translate", "none"],
        },
        summary: { type: "string" },
        target: { type: "string" },
        risk: { type: "string", enum: ["low", "medium", "high"] },
        rationale: { type: "string" },
        confidence: { type: "number" },
        field: { type: "string" },
        fromValue: { type: "string" },
        toValue: { type: "string" },
        createPayload: { type: "object" },
        deleteMode: { type: "string", enum: ["delete", "deactivate"] },
        suggestion: { type: "string" },
        currentText: { type: "string" },
        language: { type: "string" },
        translationKey: { type: "string" },
        notEditable: { type: "boolean" },
      },
      required: ["intentKind", "area", "action", "summary", "target", "risk"],
      additionalProperties: false,
    },
  },
};

const SYSTEM_PROMPT = `Du bist der Admin-Copilot für OBRENT (Luxusauto-Vermietung).
Aufgabe: Verstehe natürliche deutsche Admin-Anweisungen und gib AUSSCHLIESSLICH einen strukturierten Vorschlag über den Tool-Call "create_proposal" zurück.

Verfügbare Bereiche (area):
- vehicles (Fahrzeuge — DB-Tabelle vehicles, voll bearbeitbar; kritisch: price_per_day, available)
- settings (app_settings — Stammdaten; bearbeitbar; kritisch: phone, email; nicht löschbar)
- website (Website-Texte — NICHT direkt bearbeitbar, nur Vorschlag)
- seo (Meta-Tags — NICHT direkt bearbeitbar, nur Vorschlag)
- translations (i18n — NICHT direkt bearbeitbar, nur Vorschlag)

Regeln:
- Wähle area + intentKind + action sorgfältig.
- Bei Preisänderungen: action="update", field="price_per_day", toValue=Zahl als String.
- Bei Lösch-/Deaktivierungswünschen: action="delete", deleteMode="deactivate" bevorzugen.
- Bei neuen Fahrzeugen: action="create", createPayload mit name, category, price_per_day, available.
- Risiko: low (Text/SEO-Optimierung), medium (normale Felder), high (Preis, Verfügbarkeit, Telefon, E-Mail, Löschen, Anlegen).
- Wenn der Bereich nicht direkt bearbeitbar ist (website/seo/translations): setze notEditable=true, risk="low", action="optimize" oder "translate".
- summary: kurz, prägnant, deutsch.
- target: konkret (z. B. "vehicles · Audi RS6 · price_per_day").
- rationale: kurze Begründung, optional Hinweis auf kritische Felder.
- Schreibe NICHTS außer dem Tool-Call. KEIN Klartext.`;

type RawAiResult = {
  intentKind?: SrvIntentKind;
  area?: SrvArea;
  action?: SrvProposalAction | "none";
  summary?: string;
  target?: string;
  risk?: SrvRisk;
  rationale?: string;
  confidence?: number;
  field?: string;
  fromValue?: string;
  toValue?: string;
  createPayload?: Record<string, unknown>;
  deleteMode?: "delete" | "deactivate";
  suggestion?: string;
  currentText?: string;
  language?: string;
  translationKey?: string;
  notEditable?: boolean;
};

async function callAi(prompt: string): Promise<{
  raw: RawAiResult | null;
  rawText: string;
  error: string | null;
}> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    return { raw: null, rawText: "", error: "LOVABLE_API_KEY missing" };
  }

  let res: Response;
  try {
    res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        tools: [AI_TOOL],
        tool_choice: {
          type: "function",
          function: { name: "create_proposal" },
        },
      }),
    });
  } catch (e) {
    return {
      raw: null,
      rawText: "",
      error: e instanceof Error ? e.message : "fetch failed",
    };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      raw: null,
      rawText: body,
      error: `AI gateway ${res.status}: ${body.slice(0, 300)}`,
    };
  }

  const json = (await res.json().catch(() => null)) as
    | { choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }> }
    | null;

  const argsStr =
    json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!argsStr) {
    return {
      raw: null,
      rawText: JSON.stringify(json),
      error: "AI response missing tool_call arguments",
    };
  }
  try {
    const raw = JSON.parse(argsStr) as RawAiResult;
    return { raw, rawText: argsStr, error: null };
  } catch (e) {
    return {
      raw: null,
      rawText: argsStr,
      error: `Failed to parse tool arguments: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}

// ---------- Build SrvProposal from AI output + capability gate ----------

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function toNumberOrString(v: string | undefined): string | number {
  if (v === undefined) return "(unbestimmt)";
  const n = Number(v);
  return Number.isFinite(n) && v.trim() !== "" ? n : v;
}

function buildSrvProposalFromAi(raw: RawAiResult): SrvProposal | null {
  const area = (raw.area ?? "unknown") as SrvArea;
  const action = raw.action;
  if (!action || action === "none") return null;

  const base = {
    id: newId(),
    area,
    summary: raw.summary ?? "Vorschlag",
    target: raw.target ?? "(Ziel?)",
    risk: (raw.risk ?? "medium") as SrvRisk,
    status: "pending" as SrvProposalStatus,
    rationale: raw.rationale,
  };

  switch (action) {
    case "create":
      return {
        ...base,
        action: "create",
        payload: (raw.createPayload as Record<string, string | number | boolean>) ?? {
          name: raw.target ?? "(unbekannt)",
        },
      };
    case "update":
      return {
        ...base,
        action: "update",
        payload: {
          field: raw.field ?? "(unbestimmt)",
          from: raw.fromValue !== undefined ? toNumberOrString(raw.fromValue) : undefined,
          to: toNumberOrString(raw.toValue),
        },
      };
    case "delete":
      return {
        ...base,
        action: "delete",
        payload: { mode: raw.deleteMode ?? "deactivate" },
      };
    case "optimize":
      return {
        ...base,
        action: "optimize",
        payload: {
          current: raw.currentText,
          suggestion: raw.suggestion ?? "(kein Vorschlag generiert)",
        },
      };
    case "translate":
      return {
        ...base,
        action: "translate",
        payload: {
          language: raw.language ?? "en",
          key: raw.translationKey,
          suggestion: raw.suggestion ?? "(keine Übersetzung generiert)",
        },
      };
  }
}

function applyCapabilityGate(
  proposal: SrvProposal | null,
  area: SrvArea,
  intentKind: SrvIntentKind,
  field: string | undefined,
  notEditableHint: boolean,
): {
  proposal: SrvProposal | null;
  notice: { areaLabel: string; message: string } | null;
  noticeAppend: string;
} {
  const capKey = toCapabilityKey(area);
  const actionKind = intentToActionKind(intentKind);
  if (!capKey || !actionKind) {
    return {
      proposal: proposal
        ? { ...proposal, status: "info" as SrvProposalStatus, risk: "low" }
        : null,
      notice: {
        areaLabel: AREA_LABEL_SRV[area],
        message: NOT_EDITABLE_HINT,
      },
      noticeAppend: `\n${NOT_EDITABLE_HINT}`,
    };
  }

  const cap = CAPABILITY_MAP[capKey];
  const sourceEditable = cap.source === "database";
  const actionAllowed =
    (actionKind === "read" && cap.readable) ||
    (actionKind === "create" && cap.creatable) ||
    (actionKind === "update" && cap.updateable) ||
    (actionKind === "delete" && cap.deletable);

  if (!sourceEditable || !actionAllowed || notEditableHint) {
    return {
      proposal: proposal
        ? { ...proposal, status: "info" as SrvProposalStatus, risk: "low" }
        : null,
      notice: {
        areaLabel: cap.label,
        message: !sourceEditable
          ? NOT_EDITABLE_HINT
          : !actionAllowed
            ? `Aktion "${actionKind}" ist im Bereich ${cap.label} nicht erlaubt.`
            : NOT_EDITABLE_HINT,
      },
      noticeAppend: `\n${NOT_EDITABLE_HINT}`,
    };
  }

  // Risky field escalation
  if (proposal && field && cap.riskyFields.includes(field)) {
    const newRationale =
      (proposal.rationale ? proposal.rationale + " · " : "") +
      `Feld "${field}" gilt als kritisch — zusätzliche Bestätigung erforderlich.`;
    return {
      proposal: { ...proposal, risk: "high", rationale: newRationale },
      notice: null,
      noticeAppend: `\nFeld "${field}" ist als kritisch markiert (zusätzliche Bestätigung nötig).`,
    };
  }

  return { proposal, notice: null, noticeAppend: "" };
}

// ---------- Server function ----------

export const generateProposalFn = createServerFn({ method: "POST" })
  .middleware([attachLegacyAuth, requireAdmin])
  .inputValidator((data: unknown) =>
    z
      .object({
        prompt: z.string().min(1).max(2000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<GenerateProposalResult> => {
    const { supabase, userId } = context;
    const prompt = data.prompt.trim();

    // 1) Ask AI for structured proposal
    const { raw, rawText, error: aiError } = await callAi(prompt);

    // Fallback intent when AI fails or returns garbage
    const fallbackIntent: SrvIntent = {
      kind: "unknown",
      area: "unknown",
      action: "none",
      confidence: 0,
      raw: prompt,
    };

    if (!raw || aiError) {
      const message = `AI nicht erreichbar oder ungültige Antwort.${
        aiError ? `\n(${aiError})` : ""
      }`;
      // Log error
      const { data: logRow } = await supabase
        .from("ai_editor_logs")
        .insert({
          admin_user_id: userId,
          action: "ai_error",
          prompt,
          response: message,
          target_table: null,
          target_row_id: null,
          metadata: {
            status: "error",
            error: aiError,
            ai_raw_text: rawText.slice(0, 4000),
          },
        })
        .select("id")
        .single();

      return {
        intent: fallbackIntent,
        proposal: null,
        capabilityNotice: null,
        message,
        logId: (logRow?.id as string) ?? null,
        logError: aiError,
      };
    }

    // 2) Normalize intent + build proposal
    const intent: SrvIntent = {
      kind: (raw.intentKind ?? "unknown") as SrvIntentKind,
      area: (raw.area ?? "unknown") as SrvArea,
      action:
        (raw.action as SrvProposalAction | "none" | undefined) ?? "none",
      confidence:
        typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
          ? Math.max(0, Math.min(1, raw.confidence))
          : 0.8,
      target: raw.target,
      fields:
        raw.field && raw.toValue !== undefined
          ? { [raw.field]: toNumberOrString(raw.toValue) }
          : undefined,
      raw: prompt,
    };

    let proposal = buildSrvProposalFromAi(raw);

    // 3) Capability gate (server-side enforcement)
    const gated = applyCapabilityGate(
      proposal,
      intent.area,
      intent.kind,
      raw.field,
      raw.notEditable === true,
    );
    proposal = gated.proposal;

    const summaryLine = proposal
      ? "Vorschlag erstellt — keine Änderungen werden gespeichert."
      : "Kein Vorschlag erzeugt.";
    const message = `${summaryLine}${gated.noticeAppend}`;

    const capKey = toCapabilityKey(intent.area);
    const targetTable =
      capKey && CAPABILITY_MAP[capKey].source === "database"
        ? (CAPABILITY_MAP[capKey].table ?? null)
        : null;

    // 4) Log into ai_editor_logs (server-side, RLS as admin user)
    const { data: logRow, error: logErr } = await supabase
      .from("ai_editor_logs")
      .insert({
        admin_user_id: userId,
        action: intent.kind,
        prompt,
        response: message,
        target_table: targetTable,
        target_row_id: null,
        metadata: {
          status: proposal ? proposal.status : "info",
          intent,
          proposals: proposal ? [proposal] : [],
          capability_notice: gated.notice,
          ai_raw: raw,
          source: "ai_gateway",
        },
      })
      .select("id")
      .single();

    return {
      intent,
      proposal,
      capabilityNotice: gated.notice,
      message,
      logId: (logRow?.id as string) ?? null,
      logError: logErr?.message ?? null,
    };
  });
