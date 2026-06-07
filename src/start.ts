import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Registers attachSupabaseAuth globally so every createServerFn RPC
// from the browser carries the user's Authorization: Bearer <token> header.
// Without this, server functions using requireSupabaseAuth would 401.
export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
