// Save app_settings via server function using Cloud admin client.
// Gated by requireAdmin (Legacy auth + has_role admin) because the Cloud
// client is anonymous (admin auth lives in Legacy Supabase) and the
// app_settings RLS UPDATE policy requires a Cloud admin role.

import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { supabase as legacySupabaseBrowser } from "@/lib/supabase";

const attachLegacyAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await legacySupabaseBrowser.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);

const SettingsSchema = z.object({
  company_name: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  hours: z.string(),
  show_prices: z.boolean(),
  cta_request_label: z.string(),
  cta_reserve_label: z.string(),
  hero_video_url: z.string(),
});

export const saveAppSettings = createServerFn({ method: "POST" })
  .middleware([attachLegacyAuth, requireAdmin])
  .inputValidator((data: unknown) => SettingsSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("app_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    if (existing) {
      const { error } = await supabaseAdmin
        .from("app_settings")
        .update(data)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("app_settings").insert(data);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
