import { useEffect, useState, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

// Maintenance flag is stored in the legacy `content_revisions` table
// (used as a generic key/value store). Reads happen via a public server
// route so anonymous visitors can see the flag without needing an RLS
// policy on content_revisions. Writes go through the legacy supabase
// client and require an authenticated admin session (RLS).

const KEY_TABLE = "_app_settings";
const KEY_FIELD = "maintenance_mode";
const KEY_RECORD_ID = "00000000-0000-0000-0000-000000000001";

let cache: boolean | null = null;
const listeners = new Set<(v: boolean) => void>();

async function fetchMaintenance(): Promise<boolean> {
  if (typeof window === "undefined") return cache ?? false;
  // 1) Direct read (works for authenticated admins via legacy RLS).
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("content_revisions")
      .select("new_value, created_at")
      .eq("table_name", KEY_TABLE)
      .eq("field_name", KEY_FIELD)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      const v = (data as { new_value: unknown }).new_value;
      return v === "true" || v === true;
    }
  }
  // 2) Fallback for anonymous visitors: public server route reads via service role.
  try {
    const res = await fetch("/api/public/maintenance", { cache: "no-store" });
    if (!res.ok) return cache ?? false;
    const data = (await res.json()) as { enabled?: boolean };
    return Boolean(data.enabled);
  } catch {
    return cache ?? false;
  }
}

export async function setMaintenance(enabled: boolean): Promise<Error | null> {
  if (!isSupabaseConfigured) return new Error("Supabase nicht konfiguriert.");
  const { error } = await supabase.from("content_revisions").insert({
    table_name: KEY_TABLE,
    field_name: KEY_FIELD,
    record_id: KEY_RECORD_ID,
    new_value: enabled ? "true" : "false",
  });
  if (!error) {
    cache = enabled;
    listeners.forEach((l) => l(enabled));
  }
  return error ? new Error(error.message) : null;
}

export function useMaintenance() {
  const [enabled, setEnabled] = useState<boolean>(cache ?? false);
  const [loading, setLoading] = useState<boolean>(cache === null);

  const refresh = useCallback(async () => {
    const v = await fetchMaintenance();
    cache = v;
    setEnabled(v);
    setLoading(false);
    listeners.forEach((l) => l(v));
  }, []);

  useEffect(() => {
    if (cache === null) refresh();
    else setLoading(false);
    const l = (v: boolean) => setEnabled(v);
    listeners.add(l);
    const id = setInterval(refresh, 30_000);
    return () => {
      listeners.delete(l);
      clearInterval(id);
    };
  }, [refresh]);

  return { enabled, loading, refresh };
}
