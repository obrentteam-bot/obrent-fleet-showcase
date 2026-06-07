// Legacy Supabase auth middleware.
// Validates the Bearer token coming from the browser against the LEGACY project
// (fiikwjyjgtdanoieanuc) and exposes an authenticated supabase client + userId.

import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

export const requireLegacyAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const url = process.env.LEGACY_SUPABASE_URL;
    const anon = process.env.LEGACY_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      const missing = [
        ...(!url ? ["LEGACY_SUPABASE_URL"] : []),
        ...(!anon ? ["LEGACY_SUPABASE_ANON_KEY"] : []),
      ];
      throw new Error(
        `[legacy-supabase] Missing server env var(s): ${missing.join(", ")}`,
      );
    }

    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: missing Bearer token");
    }
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) throw new Error("Unauthorized: empty token");

    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw new Error("Unauthorized: invalid legacy session");
    }

    return next({
      context: {
        supabase,
        userId: data.user.id,
        userEmail: data.user.email ?? null,
      },
    });
  },
);
