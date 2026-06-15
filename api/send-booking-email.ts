// Vercel Serverless Function — same-origin email send via Resend.
// POST /api/send-booking-email
// RESEND_API_KEY must be set in Vercel env vars (NO VITE_ prefix → server-only).
//
// NOTE: This file lives at the project-root `api/` directory (Vercel convention).
// Vercel auto-detects `api/*.ts` as Node Serverless Functions, independent of
// the Vite SPA build under `dist/client`.

type Payload = {
  vehicle_id?: string | null;
  customer_name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  message?: string | null;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const GOLD = "#B8975A";
const ONYX = "#0A0A0A";
const PANEL_BG = "#F5F4F1";
const MUTED = "#8A8A8A";
const BORDER = "#E6E2D8";
const TEXT = "#2A2A2A";
const LOGO_URL = "https://obrent-fleet-showcase.lovable.app/obrent-logo.png";

const fmtDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : s;
};

function parseMessage(msg: string | null | undefined) {
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
}

type Row = [string, string, boolean?];
const renderRows = (rows: Row[]) => rows.map(([label, value, mono]) => `
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;width:38%;vertical-align:top;font-family:Arial,sans-serif;">${esc(label)}</td>
    <td style="padding:11px 0;border-bottom:1px solid ${BORDER};color:${TEXT};font-size:15px;${mono ? "font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;" : "font-family:Arial,sans-serif;"}vertical-align:top;">${value}</td>
  </tr>`).join("");

function buildEmails(d: Payload) {
  const { service, extras, free } = parseMessage(d.message);
  const firstName = d.customer_name.trim().split(/\s+/)[0] || d.customer_name;
  const sameDay = d.start_date === d.end_date;
  const timestamp = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin",
  }).format(new Date());

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
        <tr><td style="padding:40px 40px 8px 40px;">
          <div style="color:${GOLD};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;margin-bottom:14px;">Anfrage erhalten</div>
          <h1 style="margin:0 0 14px 0;color:${ONYX};font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:400;">Vielen Dank, ${esc(firstName)}.</h1>
          <p style="margin:0;color:${TEXT};font-family:Arial,sans-serif;font-size:15px;line-height:1.7;">Wir haben Ihre Anfrage erhalten und melden uns in Kürze persönlich bei Ihnen — typischerweise innerhalb weniger Stunden während unserer Geschäftszeiten.</p>
        </td></tr>
        <tr><td style="padding:24px 40px 8px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL_BG};border:1px solid ${BORDER};">
            <tr><td style="padding:24px 28px;">
              <div style="color:${GOLD};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;margin-bottom:12px;">Ihre Angaben</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderRows(baseRows)}</table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 40px 40px 40px;">
          <p style="margin:0;color:${MUTED};font-family:Arial,sans-serif;font-size:13px;line-height:1.7;">Bei Rückfragen erreichen Sie uns unter <a href="mailto:info@obrent.de" style="color:${TEXT};text-decoration:none;border-bottom:1px solid ${GOLD};">info@obrent.de</a>.</p>
        </td></tr>
        <tr><td style="background:#111111;padding:24px 40px;text-align:center;">
          <div style="color:#888;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">OBRENT · Luxury Fleet</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const adminRows: Row[] = [...baseRows, ["Eingegangen", esc(timestamp)]];

  const adminHtml = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Neue Anfrage</title></head>
<body style="margin:0;padding:0;background:#FFFFFF;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#FFFFFF;">
        <tr><td style="background:${ONYX};padding:24px 32px;">
          <img src="${LOGO_URL}" alt="OBRENT" width="120" style="display:inline-block;height:auto;max-width:120px;filter:brightness(0) invert(1);"/>
        </td></tr>
        <tr><td style="padding:32px 40px 8px 40px;">
          <div style="color:${GOLD};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;font-weight:700;margin-bottom:10px;">Neue Anfrage</div>
          <h1 style="margin:0;color:${ONYX};font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;font-weight:400;">${esc(d.customer_name)}</h1>
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

  const customerSubject = "Ihre Anfrage bei OBRENT — Wir melden uns in Kürze";
  const adminSubject = service
    ? `Neue Anfrage · ${service} · ${d.customer_name}`
    : `Neue Anfrage · ${d.customer_name}`;

  return { customerHtml, adminHtml, customerSubject, adminSubject };
}

// Vercel Node.js Serverless Function handler signature.
export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  let d: Payload;
  try {
    // Vercel parses JSON bodies automatically when Content-Type is application/json,
    // but fall back to manual parse if it arrives as a string.
    d = typeof req.body === "string" ? JSON.parse(req.body) : (req.body as Payload);
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  if (!d?.customer_name || !d?.email || !d?.phone) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("[send-booking-email] RESEND_API_KEY not configured");
    res.status(500).json({ error: "RESEND_API_KEY not configured" });
    return;
  }

  const { customerHtml, adminHtml, customerSubject, adminSubject } = buildEmails(d);

  const send = async (from: string, to: string, subject: string, html: string, replyTo: string) => {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
    });
    const bodyText = await r.text().catch(() => "");
    console.log(`[resend] from="${from}" to="${to}" status=${r.status} body=${bodyText.slice(0, 600)}`);
    return { ok: r.ok, status: r.status, body: bodyText };
  };

  console.log(`[send-booking-email] customer=${d.email} admin=info@obrent.de`);
  const results = await Promise.allSettled([
    send("OBRENT <noreply@obrent.de>", d.email, customerSubject, customerHtml, "info@obrent.de"),
    send("OBRENT Anfragen <noreply@obrent.de>", "info@obrent.de", adminSubject, adminHtml, d.email),
  ]);

  const failures: string[] = [];
  for (const [i, r] of results.entries()) {
    const label = i === 0 ? "customer" : "admin";
    if (r.status === "rejected") failures.push(`${label}: ${String(r.reason)}`);
    else if (!r.value.ok) failures.push(`${label}: HTTP ${r.value.status} ${r.value.body.slice(0, 300)}`);
  }

  if (failures.length === results.length) {
    res.status(502).json({ error: "Both sends failed", failures });
    return;
  }

  res.status(200).json({ ok: true, partial: failures.length > 0, failures });
}
