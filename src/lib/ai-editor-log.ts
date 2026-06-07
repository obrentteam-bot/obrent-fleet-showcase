// Legacy Supabase logging for the AI Editor.
// Inserts a row per admin prompt into `ai_editor_logs` and lets us update
// the per-proposal status later (applied / rejected). No writes to other tables.

import { supabase } from "@/lib/supabase";

export type AiEditorLogStatus =
  | "pending"
  | "applied"
  | "rejected"
  | "info"
  | "error";

export type LogPromptInput = {
  adminUserId: string;
  action: string;            // intent kind, e.g. "read" | "create" | "update" | "delete" | ...
  prompt: string;
  response: string;          // short text summary shown in chat
  targetTable?: string | null;
  targetRowId?: string | null;
  status: AiEditorLogStatus;
  error?: string | null;
  /** Anything else worth storing — intent object, proposal payloads, etc. */
  extra?: Record<string, unknown>;
};

export type LogInsertResult =
  | { id: string; error: null }
  | { id: null; error: string };

/**
 * Insert one row into ai_editor_logs (legacy Supabase). Never throws —
 * logging must not break the chat. Returns the inserted row id or an error.
 */
export async function logPrompt(input: LogPromptInput): Promise<LogInsertResult> {
  const metadata: Record<string, unknown> = {
    status: input.status,
    ...(input.error ? { error: input.error } : {}),
    ...(input.extra ?? {}),
  };

  const { data, error } = await supabase
    .from("ai_editor_logs")
    .insert({
      admin_user_id: input.adminUserId,
      action: input.action,
      prompt: input.prompt,
      response: input.response,
      target_table: input.targetTable ?? null,
      target_row_id: input.targetRowId ?? null,
      metadata,
    })
    .select("id")
    .single();

  if (error || !data) {
    // Surface the error to the caller but don't throw.
    // eslint-disable-next-line no-console
    console.warn("[ai-editor-log] insert failed:", error?.message);
    return { id: null, error: error?.message ?? "unknown insert error" };
  }
  return { id: data.id as string, error: null };
}

/**
 * Update the `metadata.status` field of an existing log row.
 * Used when the admin accepts / rejects a proposal in the UI.
 * Silently no-ops if the row is unknown or RLS blocks the update.
 */
export async function updateLogStatus(
  logId: string,
  status: AiEditorLogStatus,
): Promise<{ ok: boolean; error: string | null }> {
  // Read current metadata, merge status, write back. Two round-trips, but
  // keeps us off Postgres jsonb_set and works with the browser client.
  const { data: existing, error: readErr } = await supabase
    .from("ai_editor_logs")
    .select("metadata")
    .eq("id", logId)
    .maybeSingle();

  if (readErr) {
    // eslint-disable-next-line no-console
    console.warn("[ai-editor-log] status read failed:", readErr.message);
    return { ok: false, error: readErr.message };
  }

  const prev =
    existing && typeof existing.metadata === "object" && existing.metadata !== null
      ? (existing.metadata as Record<string, unknown>)
      : {};

  const { error: updErr } = await supabase
    .from("ai_editor_logs")
    .update({ metadata: { ...prev, status } })
    .eq("id", logId);

  if (updErr) {
    // eslint-disable-next-line no-console
    console.warn("[ai-editor-log] status update failed:", updErr.message);
    return { ok: false, error: updErr.message };
  }
  return { ok: true, error: null };
}
