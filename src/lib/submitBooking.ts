// Booking submission — runs entirely client-side, no project-domain server route.
//
// Architecture:
//   Browser → Supabase Data API (insert into `bookings`)   ← Supabase has open CORS
//   Browser → Supabase Edge Function `send-booking-email`  ← Supabase has open CORS
//
// Because both endpoints are on *.supabase.co, the request never touches our
// own domain — so neither obrent.de nor the Lovable preview can be CORS-blocked.
//
// The booking insert is the source of truth. Emails are fire-and-forget: a
// failing email send must never make the form report an error to the user.

import { supabase as legacy } from "@/lib/supabase";
import { supabase as cloud } from "@/integrations/supabase/client";

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

export async function submitBooking(payload: SubmitBookingPayload): Promise<{ error: string | null }> {
  // 1) Insert directly into the bookings table (legacy project).
  const insertPayload = {
    vehicle_id: payload.vehicle_id ?? null,
    customer_name: payload.customer_name,
    email: payload.email,
    phone: payload.phone,
    start_date: payload.start_date || null,
    end_date: payload.end_date || null,
    message: payload.message ?? null,
    status: payload.status ?? "pending",
  };
  const { error } = await legacy.from("bookings").insert(insertPayload);
  if (error) {
    return { error: error.message };
  }

  // 2) Fire-and-forget: ask the Lovable Cloud edge function to send the emails.
  //    Any failure here is logged but does not block the user — their booking
  //    is already saved and visible in the admin panel.
  try {
    const { error: fnErr } = await cloud.functions.invoke("send-booking-email", {
      body: {
        vehicle_id: payload.vehicle_id ?? null,
        customer_name: payload.customer_name,
        email: payload.email,
        phone: payload.phone,
        start_date: payload.start_date,
        end_date: payload.end_date,
        message: payload.message ?? null,
      },
    });
    if (fnErr) console.error("[send-booking-email] invoke error", fnErr);
  } catch (e) {
    console.error("[send-booking-email] threw", e);
  }

  return { error: null };
}
