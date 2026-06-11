import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Schema = z.object({
  vehicle_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(1).max(60),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  message: z.string().max(5000).optional().nullable(),
  status: z.enum(["pending", "new", "confirmed", "rejected"]).optional(),
});

export const Route = createFileRoute("/api/public/submit-booking")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const url = process.env.LEGACY_SUPABASE_URL;
        const key = process.env.LEGACY_SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });
        }
        const payload = {
          ...parsed.data,
          status: parsed.data.status ?? "pending",
        };
        const res = await fetch(`${url}/rest/v1/bookings`, {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        if (!res.ok) {
          return new Response(
            JSON.stringify({ error: "Insert failed", details: text }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response(text, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
