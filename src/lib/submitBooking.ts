import { z } from "zod";
import { supabase as legacy } from "./supabase";

export type ServiceType = "shuttle" | "chauffeur" | "langzeitmiete" | "fahrzeug";

export type SubmitBookingPayload = {
  vehicle_id?: string | null;
  customer_name: string;
  email: string;
  phone: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  message?: string | null;
  status?: "pending" | "new" | "confirmed" | "rejected";
  service_type?: ServiceType | null;
  details?: Record<string, unknown> | null;
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
  service_type: z.enum(["shuttle", "chauffeur", "langzeitmiete", "fahrzeug"]).nullable().optional(),
  details: z.record(z.unknown()).nullable().optional(),
});

/**
 * Pure client-side booking submission.
 * 1) Inserts the booking into the LEGACY Supabase `bookings` table via anon key + RLS.
 * 2) POSTs the same payload to /api/send-booking-email for Resend notifications.
 */
export async function submitBooking(
  payload: SubmitBookingPayload,
): Promise<{ error: string | null }> {
  let data: SubmitBookingPayload;
  try {
    data = submitBookingSchema.parse(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid input";
    return { error: msg };
  }

  const insertPayload: Record<string, unknown> = {
    vehicle_id: data.vehicle_id ?? null,
    customer_name: data.customer_name,
    email: data.email,
    phone: data.phone,
    start_date: data.start_date,
    end_date: data.end_date,
    message: data.message ?? null,
    status: data.status ?? "pending",
    service_type: data.service_type ?? "fahrzeug",
    details: data.details ?? null,
  };

  let { error: insertError } = await legacy.from("bookings").insert(insertPayload);

  // Backward compatibility: if the legacy table doesn't yet have the new columns,
  // retry without them so the booking is at least stored.
  if (
    insertError &&
    /service_type|details|column .* does not exist|schema cache/i.test(insertError.message)
  ) {
    console.warn("[submitBooking] retrying without service_type/details:", insertError.message);
    delete insertPayload.service_type;
    delete insertPayload.details;
    const retry = await legacy.from("bookings").insert(insertPayload);
    insertError = retry.error;
  }

  if (insertError) {
    console.error("[submitBooking] insert failed", insertError);
    return { error: insertError.message };
  }

  // Fire-and-forget email — same-origin Vercel serverless route.
  try {
    const res = await fetch("/api/send-booking-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle_id: data.vehicle_id ?? null,
        customer_name: data.customer_name,
        email: data.email,
        phone: data.phone,
        start_date: data.start_date,
        end_date: data.end_date,
        message: data.message ?? null,
        service_type: data.service_type ?? null,
        details: data.details ?? null,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[submitBooking] email send failed", res.status, body);
    }
  } catch (e) {
    console.error("[submitBooking] email request threw", e);
  }

  return { error: null };
}
