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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

export const Route = createFileRoute("/api/public/submit-booking")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }) => {

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
        }
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: "Validation failed", issues: parsed.error.issues }),
            { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
          );
        }
        const url = process.env.LEGACY_SUPABASE_URL;
        const key = process.env.LEGACY_SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } });
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
            { status: 502, headers: { "Content-Type": "application/json", ...CORS_HEADERS } },
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

            const GOLD = "#B8975A";
            const ONYX = "#0A0A0A";
            const FOOTER_BG = "#111111";
            const PANEL_BG = "#F5F4F1";
            const MUTED = "#8A8A8A";
            const BORDER = "#E6E2D8";
            const TEXT = "#2A2A2A";
            const LOGO_URL = "https://obrent-fleet-showcase.lovable.app/obrent-logo.png";

            const fmtDate = (s: string) => {
              const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
              return m ? `${m[3]}.${m[2]}.${m[1]}` : s;
            };

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
            const firstName = d.customer_name.trim().split(/\s+/)[0] || d.customer_name;
            const sameDay = d.start_date === d.end_date;
            const timestamp = new Intl.DateTimeFormat("de-DE", {
              dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin",
            }).format(new Date());

            type Row = [string, string, boolean?];
            const baseRows: Row[] = [
              ["Name", esc(d.customer_name)],
              ["E-Mail", `<a href="mailto:${esc(d.email)}" style="color:${TEXT};text-decoration:none;border-bottom:1px solid ${GOLD};">${esc(d.email)}</a>`],
              ["Telefon", `<a href="tel:${esc(d.phone)}" style="color:${TEXT};text-decoration:none;">${esc(d.phone)}</a>`],
            ];
            if (service) baseRows.push(["Service", esc(service)]);
            if (!sameDay) baseRows.push(["Zeitraum", `${esc(fmtDate(d.start_date))} &nbsp;&rarr;&nbsp; ${esc(fmtDate(d.end_date))}`]);
            else if (d.start_date) baseRows.push(["Datum", esc(fmtDate(d.start_date))]);
            for (const [k, v] of extras) baseRows.push([k, esc(v)]);
            if (d.vehicle_id) baseRows.push(["Fahrzeug-ID", esc(d.vehicle_id), true]);
            if (free) baseRows.push(["Nachricht", `<div style="white-space:pre-wrap;line-height:1.6;">${esc(free)}</div>`]);

            const renderRows = (rows: Row[]) => rows.map(([label, value, mono]) => `
              <tr>
                <td style="padding:11px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;width:38%;vertical-align:top;font-family:Arial,sans-serif;">${esc(label)}</td>
                <td style="padding:11px 0;border-bottom:1px solid ${BORDER};color:${TEXT};font-size:15px;${mono ? "font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;" : "font-family:Arial,sans-serif;"}vertical-align:top;">${value}</td>
              </tr>`).join("");

            const customerHtml = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>OBRENT</title></head>
<body style="margin:0;padding:0;background:#FFFFFF;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Wir haben Ihre Anfrage erhalten und melden uns in Kürze persönlich bei Ihnen.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;">
        <tr><td style="background:${ONYX};padding:32px;text-align:center;">
          <img src="${LOGO_URL}" alt="OBRENT" width="150" style="display:inline-block;height:auto;max-width:150px;filter:brightness(0) invert(1);"/>
        </td></tr>
        <tr><td style="height:2px;background:${GOLD};line-height:2px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:48px 48px 8px 48px;">
          <h1 style="margin:0 0 20px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.25;color:${ONYX};font-weight:400;">
            Vielen Dank für Ihre Anfrage, ${esc(firstName)}.
          </h1>
          <p style="margin:0 0 32px 0;color:${TEXT};font-family:Arial,sans-serif;font-size:15px;line-height:1.7;">
            Wir haben Ihre Anfrage erhalten und werden uns innerhalb weniger Stunden persönlich bei Ihnen melden.
          </p>
        </td></tr>
        <tr><td style="padding:0 48px;"><div style="height:1px;background:${GOLD};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
        <tr><td style="padding:32px 48px 8px 48px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL_BG};border:1px solid ${BORDER};">
            <tr><td style="padding:28px;">
              <div style="color:${GOLD};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;margin-bottom:14px;">Ihre Anfrage</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderRows(baseRows)}</table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:32px 48px 0 48px;"><div style="height:1px;background:${GOLD};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
        <tr><td style="padding:28px 48px 48px 48px;color:${TEXT};font-family:Arial,sans-serif;font-size:15px;line-height:1.8;">
          Mit freundlichen Grüßen<br/>
          <strong style="color:${ONYX};">Ihr OBRENT Team</strong>
        </td></tr>
        <tr><td style="background:${FOOTER_BG};padding:36px 48px;text-align:center;">
          <img src="${LOGO_URL}" alt="OBRENT" width="96" style="display:inline-block;height:auto;max-width:96px;filter:brightness(0) invert(1);margin-bottom:18px;"/>
          <div style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:13px;line-height:1.8;letter-spacing:0.04em;">Luxus Autovermietung &middot; Ludwigshafen am Rhein</div>
          <div style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:13px;line-height:1.8;">
            <a href="https://obrent.de" style="color:${GOLD};text-decoration:none;">obrent.de</a>
            &nbsp;&middot;&nbsp;
            <a href="mailto:info@obrent.de" style="color:${GOLD};text-decoration:none;">info@obrent.de</a>
          </div>
          <div style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:13px;line-height:1.8;margin-bottom:18px;">
            <a href="tel:+4915569459633" style="color:#FFFFFF;text-decoration:none;">+49 15569 459633</a>
          </div>
          <div style="color:#8A8A8A;font-family:Arial,sans-serif;font-size:11px;line-height:1.7;max-width:440px;margin:0 auto;">
            Diese E-Mail wurde automatisch generiert. Für Rückfragen antworten Sie bitte direkt auf diese E-Mail oder schreiben Sie uns an
            <a href="mailto:info@obrent.de" style="color:${GOLD};text-decoration:none;">info@obrent.de</a>.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

            const adminRows: Row[] = [...baseRows, ["Eingegangen", esc(timestamp)]];
            const adminHtml = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Neue Anfrage</title></head>
<body style="margin:0;padding:0;background:#FFFFFF;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Neue Anfrage von ${esc(d.customer_name)}${service ? ` · ${esc(service)}` : ""}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;">
        <tr><td style="background:${ONYX};padding:24px 32px;text-align:center;">
          <img src="${LOGO_URL}" alt="OBRENT" width="120" style="display:inline-block;height:auto;max-width:120px;filter:brightness(0) invert(1);"/>
        </td></tr>
        <tr><td style="height:2px;background:${GOLD};line-height:2px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:36px 40px 8px 40px;">
          <div style="color:${GOLD};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;margin-bottom:12px;">
            Neue Anfrage${service ? ` · ${esc(service)}` : ""}
          </div>
          <h1 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${ONYX};font-weight:400;">
            ${esc(d.customer_name)}
          </h1>
          <p style="margin:0 0 24px 0;color:${TEXT};font-family:Arial,sans-serif;font-size:14px;line-height:1.65;">
            Eine neue Anfrage ist über das Website-Formular eingegangen. Antworten Sie direkt auf diese E-Mail, um dem Kunden zu schreiben.
          </p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL_BG};border:1px solid ${BORDER};">
            <tr><td style="padding:24px 28px;">
              <div style="color:${GOLD};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Details</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderRows(adminRows)}</table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 40px 40px 40px;text-align:center;">
          <a href="https://obrent.de/admin" style="display:inline-block;background:${ONYX};color:#FFFFFF;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;text-decoration:none;padding:14px 28px;border:1px solid ${GOLD};">
            Im Admin-Panel einsehen
          </a>
          <div style="margin-top:12px;color:${MUTED};font-family:Arial,sans-serif;font-size:12px;">obrent.de/admin</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

            const send = (from: string, to: string, subject: string, html: string, replyTo: string) =>
              fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
              });

            const custSubject = "Ihre Anfrage bei OBRENT — Wir melden uns in Kürze";
            const adminSubject = service
              ? `Neue Anfrage · ${service} · ${d.customer_name}`
              : `Neue Anfrage · ${d.customer_name}`;

            const [custRes, adminRes] = await Promise.allSettled([
              send("OBRENT <noreply@obrent.de>", d.email, custSubject, customerHtml, "info@obrent.de"),
              send("OBRENT <info@obrent.de>", "info@obrent.de", adminSubject, adminHtml, d.email),
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
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        });

      },
    },
  },
});
