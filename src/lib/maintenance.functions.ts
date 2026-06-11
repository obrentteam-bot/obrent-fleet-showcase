import { createServerFn } from "@tanstack/react-start";

// Legacy project (where admins log in). Anon key is public/publishable.
const LEGACY_URL = "https://fiikwjyjgtdanoieanuc.supabase.co";
const LEGACY_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpaWt3anlqZ3RkYW5vaWVhbnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MzA5MzksImV4cCI6MjA5MzQwNjkzOX0.tBGKCTd4E53sPaU4X4iEpXPBukCZ7JHDsvQ_qZrdyGw";

type Input = { enabled: boolean; token: string };

// Sets the maintenance flag in the Lovable Cloud app_settings table.
// Caller must be an authenticated admin of the legacy project.
export const setMaintenanceMode = createServerFn({ method: "POST" })
  .inputValidator((input: Input) => {
    if (typeof input?.enabled !== "boolean") throw new Error("Invalid input");
    if (typeof input?.token !== "string" || input.token.length < 20 || input.token.length > 4096) {
      throw new Error("Invalid token");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const url = process.env.LEGACY_SUPABASE_URL || LEGACY_URL;
    const anon = process.env.LEGACY_SUPABASE_ANON_KEY || LEGACY_ANON;
    const headers = { apikey: anon, Authorization: `Bearer ${data.token}` };

    // 1) Validate the legacy session.
    const userRes = await fetch(`${url}/auth/v1/user`, { headers });
    if (!userRes.ok) throw new Error("Unauthorized");
    const user = (await userRes.json()) as { id?: string };
    if (!user?.id) throw new Error("Unauthorized");

    // 2) Verify admin role (RLS lets users read their own role).
    const roleRes = await fetch(
      `${url}/rest/v1/user_roles?user_id=eq.${user.id}&role=eq.admin&select=role&limit=1`,
      { headers },
    );
    if (!roleRes.ok) throw new Error("Forbidden");
    const roles = (await roleRes.json()) as unknown[];
    if (!Array.isArray(roles) || roles.length === 0) throw new Error("Forbidden");

    // 3) Update the flag in Lovable Cloud (service role, bypasses RLS).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .update({ maintenance_mode: data.enabled })
      .not("id", "is", null);
    if (error) throw new Error(error.message);

    return { ok: true, enabled: data.enabled };
  });
