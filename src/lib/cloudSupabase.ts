import { createClient } from "@supabase/supabase-js";

// Hardcoded Cloud (Lovable Cloud) anon client — used ONLY for reading
// app_settings, since the project's main `@/integrations/supabase/client`
// is configured (via Vercel env vars) to point at the LEGACY project.
const CLOUD_URL = "https://nvrtqhkcxjskhhbonjqy.supabase.co";
const CLOUD_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnRxaGtjeGpza2hoYm9uanF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjcxODgsImV4cCI6MjA5NjQwMzE4OH0.YdVahc8a0I0nw9LziSqehHBa-jDt-6DHzrbMedONKy8";

export const cloudSupabase = createClient(CLOUD_URL, CLOUD_ANON, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    storageKey: "obrent-cloud-anon",
  },
});
