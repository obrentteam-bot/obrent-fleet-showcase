import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const isSupabaseConfigured = true;

export type AppSettings = {
  id?: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  show_prices: boolean;
  cta_request_label: string;
  cta_reserve_label: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  company_name: "OBRENT",
  address: "Industriestraße 60, 67063 Ludwigshafen am Rhein",
  phone: "+49 15569 459633",
  email: "info@obrent.de",
  hours: "Mo–Fr: 08:00–22:00 Uhr\nSa–So: 09:00–20:00 Uhr",
  show_prices: false,
  cta_request_label: "Anfrage senden",
  cta_reserve_label: "Anfragen",
};


let cache: AppSettings | null = null;
const listeners = new Set<(s: AppSettings) => void>();

async function fetchSettings(): Promise<AppSettings> {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
  if (data) {
    const row = data as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...row,
      show_prices: row.show_prices ?? false,
      cta_request_label: row.cta_request_label || DEFAULT_SETTINGS.cta_request_label,
      cta_reserve_label: row.cta_reserve_label || DEFAULT_SETTINGS.cta_reserve_label,
    };
  }

  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(cache ?? DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cache);

  const refresh = useCallback(async () => {
    const s = await fetchSettings();
    cache = s;
    setSettings(s);
    setLoading(false);
    listeners.forEach((l) => l(s));
  }, []);

  useEffect(() => {
    if (!cache) refresh();
    const l = (s: AppSettings) => setSettings(s);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, [refresh]);

  return { settings, loading, refresh };
}

export async function saveSettings(s: AppSettings) {
  if (!isSupabaseConfigured) return new Error("Supabase is not configured.");
  const payload = {
    company_name: s.company_name,
    address: s.address,
    phone: s.phone,
    email: s.email,
    hours: s.hours,
    show_prices: s.show_prices,
    cta_request_label: s.cta_request_label,
    cta_reserve_label: s.cta_reserve_label,
  };
  try {
    const { saveAppSettings } = await import("@/lib/settings.functions");
    await saveAppSettings({ data: payload });
    cache = { ...s };
    listeners.forEach((l) => l(cache!));
    return null;
  } catch (e: any) {
    return new Error(e?.message || "Speichern fehlgeschlagen");
  }
}

