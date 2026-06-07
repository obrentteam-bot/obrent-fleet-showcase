// Server-only admin client for the LEGACY Supabase project (fiikwjyjgtdanoieanuc).
// NEVER import this from client-reachable modules at top level.
// Bypasses RLS — only use inside trusted createServerFn handlers or server routes.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getLegacySupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.LEGACY_SUPABASE_URL;
  const serviceKey = process.env.LEGACY_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    const missing = [
      ...(!url ? ["LEGACY_SUPABASE_URL"] : []),
      ...(!serviceKey ? ["LEGACY_SUPABASE_SERVICE_ROLE_KEY"] : []),
    ];
    throw new Error(
      `[legacy-supabase] Missing server env var(s): ${missing.join(", ")}`,
    );
  }

  cached = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cached;
}
