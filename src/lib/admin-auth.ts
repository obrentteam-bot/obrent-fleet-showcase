// requireAdmin: chains legacy auth + has_role(uuid,'admin'::app_role) check.
// Use as middleware on any admin-only server function.

import { createMiddleware } from "@tanstack/react-start";
import { requireLegacyAuth } from "@/integrations/legacy-supabase/auth-middleware";

export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireLegacyAuth])
  .server(async ({ next, context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) {
      throw new Error(`[requireAdmin] has_role failed: ${error.message}`);
    }
    if (data !== true) {
      throw new Error("Forbidden: admin role required");
    }

    return next({ context: { ...context, isAdmin: true as const } });
  });
