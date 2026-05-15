import { useEffect, useState, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

export type AppSettings = {
  id?: string;
  company_name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
};

export const DEFAULT_SETTINGS: AppSettings = {
  company_name: "OBRENT",
  address: "Käferthaler Straße 40, 68167 Mannheim",
  phone: "+49 15569 459633",
  email: "concierge@obrent.com",
  hours: "Mo–So: 24/7 Concierge",
};

let cache: AppSettings | null = null;
const listeners = new Set<(s: AppSettings) => void>();

async function fetchSettings(): Promise<AppSettings> {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS;
  const { data } = await supabase.from("app_settings").select("*").limit(1).maybeSingle();
  if (data) return data as AppSettings;
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
  const { data: existing } = await supabase.from("app_settings").select("id").limit(1).maybeSingle();
  const payload = {
    company_name: s.company_name,
    address: s.address,
    phone: s.phone,
    email: s.email,
    hours: s.hours,
  };
  const res = existing
    ? await supabase.from("app_settings").update(payload).eq("id", existing.id)
    : await supabase.from("app_settings").insert(payload);
  if (!res.error) {
    cache = { ...s };
    listeners.forEach((l) => l(cache!));
  }
  return res.error;
}
