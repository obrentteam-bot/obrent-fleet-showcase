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

            // Brand palette
            const GOLD = "#B8975A";
            const ONYX = "#0A0A0A";
            const CREAM = "#F5F0E8";
            const MUTED = "#8A8A8A";
            const BORDER = "#E8E2D6";
            const LOGO_URL = "https://obrent-fleet-showcase.lovable.app/obrent-logo.png";

            // Parse the structured "message" body (Service: X\nLabel: value\n...) into rows.
            // Falls back to a single Nachricht row when no structure is present.
            const parseMessage = (msg: string | null | undefined) => {
              if (!msg) return { service: null as string | null, extras: [] as Array<[string, string]>, free: null as string | null };
              const lines = msg.split("\n").map((l) => l.trim()).filter(Boolean);
              let service: string | null = null;
              const extras: Array<[string, string]> = [];
              const freeLines: string[] = [];
              for (const line of lines) {
                const idx = line.indexOf(":");
                if (idx > 0 && idx < 40) {
                  const k = line.slice(0, idx).trim();
                  const v = line.slice(idx + 1).trim();
                  if (k.toLowerCase() === "service") service = v;
                  else if (v) extras.push([k, v]);
                } else {
                  freeLines.push(line);
                }
              }
              return { service, extras, free: freeLines.join("\n") || null };
            };
            const { service, extras, free } = parseMessage(d.message);

            const sameDay = d.start_date === d.end_date;
            const row = (label: string, value: string, mono = false) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;width:38%;vertical-align:top;">${esc(label)}</td>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${ONYX};font-size:15px;${mono ? "font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;" : ""}vertical-align:top;">${value}</td>
              </tr>`;

            const summaryRows = [
              row("Name", esc(d.customer_name)),
              row("E-Mail", `<a href="mailto:${esc(d.email)}" style="color:${ONYX};text-decoration:none;border-bottom:1px solid ${GOLD};">${esc(d.email)}</a>`),
              row("Telefon", `<a href="tel:${esc(d.phone)}" style="color:${ONYX};text-decoration:none;">${esc(d.phone)}</a>`),
              service ? row("Service", esc(service)) : "",
              !sameDay ? row("Zeitraum", `${esc(d.start_date)} &nbsp;&rarr;&nbsp; ${esc(d.end_date)}`) : "",
              d.vehicle_id ? row("Fahrzeug-ID", esc(d.vehicle_id), true) : "",
              ...extras.map(([k, v]) => row(k, esc(v))),
              free ? row("Nachricht", `<div style="white-space:pre-wrap;line-height:1.6;">${esc(free)}</div>`) : "",
            ].filter(Boolean).join("");

            // Premium frame shared by both emails.
            const frame = (opts: { preheader: string; eyebrow: string; headline: string; intro: string; rows: string; closing?: string }) => `
<!doctype html>
<html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>OBRENT</title></head>
<body style="margin:0;padding:0;background:${CREAM};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(opts.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid ${BORDER};">
        <tr><td style="background:${ONYX};padding:28px 32px;text-align:center;">
          <img src="${LOGO_URL}" alt="OBRENT" width="140" style="display:inline-block;height:auto;max-width:140px;"/>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,${ONYX} 0%,${GOLD} 50%,${ONYX} 100%);line-height:3px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:40px 40px 8px 40px;">
          <div style="color:${GOLD};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;margin-bottom:14px;">${esc(opts.eyebrow)}</div>
          <h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:${ONYX};font-weight:400;letter-spacing:-0.01em;">${esc(opts.headline)}</h1>
          <p style="margin:0 0 28px 0;color:#4A4A4A;font-family:Arial,sans-serif;font-size:15px;line-height:1.65;">${esc(opts.intro)}</p>
        </td></tr>
        <tr><td style="padding:0 40px 8px 40px;">
          <div style="border-top:1px solid ${GOLD};width:48px;margin-bottom:18px;"></div>
          <div style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${ONYX};margin-bottom:8px;">Ihre Anfrage</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">${opts.rows}</table>
        </td></tr>
        ${opts.closing ? `<tr><td style="padding:28px 40px 8px 40px;color:#4A4A4A;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;">${opts.closing}</td></tr>` : ""}
        <tr><td style="padding:36px 40px 32px 40px;">
          <div style="border-top:1px solid ${BORDER};padding-top:24px;text-align:center;font-family:Arial,sans-serif;">
            <div style="color:${ONYX};font-size:13px;letter-spacing:0.24em;text-transform:uppercase;margin-bottom:10px;">OBRENT</div>
            <div style="color:${MUTED};font-size:12px;line-height:1.7;">
              Luxus Autovermietung &middot; Chauffeur &middot; VIP Shuttle<br/>
              <a href="mailto:info@obrent.de" style="color:${GOLD};text-decoration:none;">info@obrent.de</a>
              &nbsp;&middot;&nbsp;
              <a href="https://obrent.de" style="color:${GOLD};text-decoration:none;">obrent.de</a>
            </div>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

            const customerHtml = frame({
              preheader: "Wir haben Ihre Anfrage erhalten und melden uns in Kürze persönlich bei Ihnen.",
              eyebrow: "Bestätigung",
              headline: "Vielen Dank für Ihre Anfrage.",
              intro: `Sehr geehrte/r ${d.customer_name}, wir haben Ihre Anfrage erhalten und melden uns innerhalb weniger Stunden persönlich bei Ihnen. Für Rückfragen antworten Sie einfach auf diese E-Mail.`,
              rows: summaryRows,
              closing: `Mit freundlichen Grüßen<br/><strong style="color:${ONYX};">Ihr OBRENT Team</strong>`,
            });

            const adminHtml = frame({
              preheader: `Neue Anfrage von ${d.customer_name}`,
              eyebrow: service ? `Neue Anfrage · ${service}` : "Neue Anfrage",
              headline: `${d.customer_name}`,
              intro: `Eine neue Anfrage ist über das Website-Formular eingegangen. Antworten Sie direkt auf diese E-Mail, um dem Kunden zu schreiben.`,
              rows: summaryRows,
            });

            const send = (to: string, subject: string, html: string, replyTo: string) =>
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
                  reply_to: replyTo,
                }),
              });

            const custSubject = service
              ? `Ihre ${service}-Anfrage bei OBRENT — wir melden uns in Kürze`
              : "Ihre Anfrage bei OBRENT — wir melden uns in Kürze";
            const adminSubject = service
              ? `Neue Anfrage · ${service} · ${d.customer_name}`
              : `Neue Anfrage · ${d.customer_name}`;

            const [custRes, adminRes] = await Promise.allSettled([
              // Customer: reply-to OBRENT inbox so replies reach the team.
              send(d.email, custSubject, customerHtml, "info@obrent.de"),
              // Admin: reply-to customer so hitting "Reply" writes the customer.
              send("info@obrent.de", adminSubject, adminHtml, d.email),
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
