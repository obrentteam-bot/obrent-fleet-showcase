import { useEffect, useState, useCallback } from "react";
import { supabase as cloud } from "@/integrations/supabase/client";

// Maintenance flag lives in the Lovable Cloud `app_settings` table.
// Read: direct Supabase client (publicly readable).
// Write: direct Supabase RPC `set_maintenance_mode(boolean)` (SECURITY DEFINER).
// No server function involved — works on Vercel without a server runtime.

let cache: boolean | null = null;
const listeners = new Set<(v: boolean) => void>();

function broadcast(v: boolean) {
  cache = v;
  listeners.forEach((l) => l(v));
}

async function fetchMaintenance(): Promise<boolean> {
  const { data, error } = await cloud
    .from("app_settings")
    .select("maintenance_mode")
    .limit(1)
    .maybeSingle();
  if (error || !data) return cache ?? false;
  return Boolean(data.maintenance_mode);
}

export async function setMaintenance(enabled: boolean): Promise<Error | null> {
  const { data, error } = await cloud.rpc("set_maintenance_mode", {
    _enabled: enabled,
  });
  if (error) return new Error(error.message);
  broadcast(typeof data === "boolean" ? data : enabled);
  return null;
}

export function useMaintenance() {
  const [enabled, setEnabled] = useState<boolean>(cache ?? false);
  const [loading, setLoading] = useState<boolean>(cache === null);

  const refresh = useCallback(async () => {
    const v = await fetchMaintenance();
    setLoading(false);
    broadcast(v);
  }, []);

  useEffect(() => {
    const l = (v: boolean) => {
      setEnabled(v);
      setLoading(false);
    };
    listeners.add(l);
    if (cache === null) refresh();
    else setLoading(false);

    return () => {
      listeners.delete(l);
    };
  }, [refresh]);

  return { enabled, loading, refresh };
}
