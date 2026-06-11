import { useEffect, useState, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

// Maintenance flag is stored as a row in content_revisions (used here as a
// generic key/value store) with table_name='_app_settings' and
// field_name='maintenance_mode'. The most recent row wins.

const KEY_TABLE = "_app_settings";
const KEY_FIELD = "maintenance_mode";
const KEY_RECORD_ID = "00000000-0000-0000-0000-000000000001";

let cache: boolean | null = null;
const listeners = new Set<(v: boolean) => void>();

async function fetchMaintenance(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data } = await supabase
    .from("content_revisions")
    .select("new_value")
    .eq("table_name", KEY_TABLE)
    .eq("field_name", KEY_FIELD)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.new_value === "true";
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
    // Re-check periodically so visitors see updates without manual reload
    const id = setInterval(refresh, 30_000);
    return () => {
      listeners.delete(l);
      clearInterval(id);
    };
  }, [refresh]);

  return { enabled, loading, refresh };
}
