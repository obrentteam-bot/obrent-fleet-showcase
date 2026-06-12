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
        // Insert succeeded — try to send confirmation + admin notification.
        // Email failures must NOT fail the booking; log and continue.
        try {
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            const d = parsed.data;
            const esc = (s: string) =>
              s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
            const summaryRows = `
              <tr><td style="padding:6px 0;color:#666;">Name</td><td style="padding:6px 0;">${esc(d.customer_name)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">E-Mail</td><td style="padding:6px 0;">${esc(d.email)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">Telefon</td><td style="padding:6px 0;">${esc(d.phone)}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">Zeitraum</td><td style="padding:6px 0;">${esc(d.start_date)} – ${esc(d.end_date)}</td></tr>
              ${d.vehicle_id ? `<tr><td style="padding:6px 0;color:#666;">Fahrzeug-ID</td><td style="padding:6px 0;font-family:monospace;font-size:12px;">${esc(d.vehicle_id)}</td></tr>` : ""}
              ${d.message ? `<tr><td style="padding:6px 0;color:#666;vertical-align:top;">Nachricht</td><td style="padding:6px 0;white-space:pre-wrap;">${esc(d.message)}</td></tr>` : ""}
            `;

            const customerHtml = `
              <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#111;">
                <h1 style="font-size:22px;font-weight:600;margin:0 0 8px;">Vielen Dank für Ihre Anfrage</h1>
                <p style="color:#555;line-height:1.6;margin:0 0 24px;">Wir haben Ihre Anfrage erhalten und melden uns innerhalb weniger Stunden persönlich bei Ihnen.</p>
                <div style="border-top:1px solid #e5e5e5;padding-top:16px;">
                  <p style="font-weight:600;margin:0 0 8px;">Zusammenfassung</p>
                  <table style="width:100%;border-collapse:collapse;font-size:14px;">${summaryRows}</table>
                </div>
                <p style="color:#888;font-size:12px;line-height:1.6;margin:32px 0 0;border-top:1px solid #e5e5e5;padding-top:16px;">
                  OBRENT — Luxus Autovermietung<br/>
                  Kontakt: <a href="mailto:info@obrent.de" style="color:#888;">info@obrent.de</a>
                </p>
              </div>
            `;

            const adminHtml = `
              <div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
                <h2 style="font-size:18px;margin:0 0 12px;">Neue Buchungsanfrage</h2>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">${summaryRows}</table>
              </div>
            `;

            const send = (to: string, subject: string, html: string, replyTo?: string) =>
              fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${resendKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "OBRENT <info@obrent.de>",
                  to: [to],
                  subject,
                  html,
                  ...(replyTo ? { reply_to: replyTo } : {}),
                }),
              });

            const [custRes, adminRes] = await Promise.allSettled([
              send(d.email, "Ihre Anfrage bei OBRENT — wir melden uns in Kürze", customerHtml),
              send("info@obrent.de", `Neue Anfrage: ${d.customer_name}`, adminHtml, d.email),
            ]);
            for (const r of [custRes, adminRes]) {
              if (r.status === "fulfilled" && !r.value.ok) {
                console.error("[resend] send failed", r.value.status, await r.value.text().catch(() => ""));
              } else if (r.status === "rejected") {
                console.error("[resend] send threw", r.reason);
              }
            }
          } else {
            console.warn("[resend] RESEND_API_KEY not configured; skipping emails");
          }
        } catch (e) {
          console.error("[resend] unexpected error", e);
        }

        return new Response(text, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
