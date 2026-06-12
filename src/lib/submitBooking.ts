// Submit a booking via the server route, which uses the service role to
// bypass RLS. The direct anon-keyed supabase.from("bookings").insert() is
// blocked by the project's RLS policy, so all public forms route through here.
//
// IMPORTANT: The production domain obrent.de is served as a static site
// (Vercel) and does NOT host the TanStack server routes. The API only lives
// on the Lovable Worker, so we always POST to the absolute Lovable URL.
// On the Lovable preview/published origin we use a same-origin relative URL.

const LOVABLE_API_ORIGIN = "https://obrent-fleet-showcase.lovable.app";

function resolveEndpoint(): string {
  if (typeof window === "undefined") return `${LOVABLE_API_ORIGIN}/api/public/submit-booking`;
  const host = window.location.hostname;
  const isLovableHost = host.endsWith(".lovable.app");
  return isLovableHost
    ? "/api/public/submit-booking"
    : `${LOVABLE_API_ORIGIN}/api/public/submit-booking`;
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
  try {
    const res = await fetch(resolveEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data?.error) msg = data.error;
        if (data?.details) msg = `${msg}: ${data.details}`;
      } catch { /* ignore */ }
      return { error: msg };
    }
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Network error" };
  }
}
