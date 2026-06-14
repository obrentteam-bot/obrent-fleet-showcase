import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CLOUD_URL_FALLBACK = "https://nvrtqhkcxjskhhbonjqy.supabase.co";
const CLOUD_PUBLISHABLE_KEY_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnRxaGtjeGpza2hoYm9uanF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjcxODgsImV4cCI6MjA5NjQwMzE4OH0.YdVahc8a0I0nw9LziSqehHBa-jDt-6DHzrbMedONKy8";

export type SubmitBookingPayload = {
  vehicle_id?: string | null;
  customer_name: string;
  email: string;
  phone: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  message?: string | null;
  status?: "pending" | "new" | "confirmed" | "rejected";
};

const submitBookingSchema = z.object({
  vehicle_id: z.string().max(200).nullable().optional(),
  customer_name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().min(3).max(50),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  message: z.string().max(5000).nullable().optional(),
  status: z.enum(["pending", "new", "confirmed", "rejected"]).optional(),
});

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((input: SubmitBookingPayload) => submitBookingSchema.parse(input))
  .handler(async ({ data }) => {
    const { getLegacySupabaseAdmin } = await import("@/integrations/legacy-supabase/client.server");
    const legacyAdmin = getLegacySupabaseAdmin();

    const insertPayload = {
      vehicle_id: data.vehicle_id ?? null,
      customer_name: data.customer_name,
      email: data.email,
      phone: data.phone,
      start_date: data.start_date,
      end_date: data.end_date,
      message: data.message ?? null,
      status: data.status ?? "pending",
    };

    const { error } = await legacyAdmin.from("bookings").insert(insertPayload);
    if (error) {
      console.error("[submitBooking] insert failed", error);
      return { error: error.message };
    }

    const cloudUrl = process.env.SUPABASE_URL || CLOUD_URL_FALLBACK;
    const cloudPublishableKey =
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      CLOUD_PUBLISHABLE_KEY_FALLBACK;

    try {
      const response = await fetch(`${cloudUrl}/functions/v1/send-booking-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: cloudPublishableKey,
          Authorization: `Bearer ${cloudPublishableKey}`,
        },
        body: JSON.stringify({
          vehicle_id: data.vehicle_id ?? null,
          customer_name: data.customer_name,
          email: data.email,
          phone: data.phone,
          start_date: data.start_date,
          end_date: data.end_date,
          message: data.message ?? null,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(
          `[submitBooking] email send failed status=${response.status} body=${body.slice(0, 300)}`,
        );
      }
    } catch (e) {
      console.error("[submitBooking] email request threw", e);
    }

    return { error: null };
  });
