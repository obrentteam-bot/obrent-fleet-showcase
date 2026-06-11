import { useEffect, useState, useCallback } from "react";
import { supabase as cloud } from "@/integrations/supabase/client";
import { supabase as legacy } from "./supabase";
import { setMaintenanceMode } from "./maintenance.functions";

// Maintenance flag lives in the Lovable Cloud `app_settings` table
// (column `maintenance_mode`, publicly readable). Updates arrive
// instantly via a realtime subscription — no reload needed.

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
  try {
    const { data } = await legacy.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return new Error("Nicht eingeloggt.");
    await setMaintenanceMode({ data: { enabled, token } });
    broadcast(enabled);
    return null;
  } catch (e) {
    return e instanceof Error ? e : new Error("Speichern fehlgeschlagen.");
  }
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

    // Realtime: instant updates for all visitors, no reload.
    const channel = cloud
      .channel(`app-settings-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "app_settings" },
        (payload) => {
          const row = payload.new as { maintenance_mode?: boolean } | null;
          if (row && typeof row.maintenance_mode === "boolean") {
            broadcast(row.maintenance_mode);
          } else {
            refresh();
          }
        },
      )
      .subscribe();

    return () => {
      listeners.delete(l);
      cloud.removeChannel(channel);
    };
  }, [refresh]);

  return { enabled, loading, refresh };
}
