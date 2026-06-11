import { createFileRoute } from "@tanstack/react-router";

const LEGACY_URL = "https://fiikwjyjgtdanoieanuc.supabase.co";

async function readFlag(): Promise<boolean> {
  const key =
    process.env.LEGACY_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.LEGACY_SUPABASE_ANON_KEY ||
    "";
  if (!key) return false;
  const url =
    `${LEGACY_URL}/rest/v1/content_revisions` +
    `?table_name=eq._app_settings&field_name=eq.maintenance_mode` +
    `&select=new_value&order=created_at.desc&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return false;
  const rows = (await res.json()) as Array<{ new_value: unknown }>;
  const v = rows[0]?.new_value;
  return v === "true" || v === true;
}

export const Route = createFileRoute("/api/public/maintenance")({
  server: {
    handlers: {
      GET: async () => {
        const enabled = await readFlag();
        return new Response(JSON.stringify({ enabled }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
