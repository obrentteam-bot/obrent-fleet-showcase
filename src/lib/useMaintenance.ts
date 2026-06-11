import { useEffect, useState, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

const KEY = "maintenance_mode";

let cache: boolean | null = null;
const listeners = new Set<(v: boolean) => void>();

async function fetchMaintenance(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data, error } = await supabase
    .from("site_flags")
    .select("value")
    .eq("key", KEY)
    .maybeSingle();
  if (error) {
    console.error("[maintenance] fetch error", error);
    return false;
  }
  return data?.value === "true";
}

export async function setMaintenance(enabled: boolean): Promise<Error | null> {
  if (!isSupabaseConfigured) return new Error("Supabase nicht konfiguriert.");
  const { error } = await supabase
    .from("site_flags")
    .upsert(
      { key: KEY, value: enabled ? "true" : "false", updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
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
