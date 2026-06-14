// Booking submission — runs entirely client-side, no project-domain server route.
//
// Architecture:
//   Browser → Supabase Data API (insert into `bookings`)
//   Browser → public Edge Function `send-booking-email`
//
// The booking insert is the source of truth. Emails are fire-and-forget: a
// failing email send must never make the form report an error to the user.

import { supabase as legacy } from "@/lib/supabase";

const CLOUD_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://nvrtqhkcxjskhhbonjqy.supabase.co";

const CLOUD_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cnRxaGtjeGpza2hoYm9uanF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjcxODgsImV4cCI6MjA5NjQwMzE4OH0.YdVahc8a0I0nw9LziSqehHBa-jDt-6DHzrbMedONKy8";

async function sendBookingEmail(payload: SubmitBookingPayload) {
  const response = await fetch(`${CLOUD_URL}/functions/v1/send-booking-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: CLOUD_ANON_KEY,
      Authorization: `Bearer ${CLOUD_ANON_KEY}`,
    },
    body: JSON.stringify({
      vehicle_id: payload.vehicle_id ?? null,
      customer_name: payload.customer_name,
      email: payload.email,
      phone: payload.phone,
      start_date: payload.start_date,
      end_date: payload.end_date,
      message: payload.message ?? null,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}${body ? ` ${body.slice(0, 300)}` : ""}`);
  }
}

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

  // 2) Fire-and-forget: ask the public edge function to send the emails.
  //    Any failure here is logged but does not block the user — their booking
  //    is already saved and visible in the admin panel.
  try {
    await sendBookingEmail(payload);
  } catch (e) {
    console.error("[send-booking-email] threw", e);
  }

  return { error: null };
}
