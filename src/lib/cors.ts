// Shared CORS helper for public server routes.
// Allows the published Lovable origin and the obrent.de site (with/without www)
// to call our API. Falls back to the published Lovable origin when the request
// origin is missing or not in the allow-list.

const ALLOWED_ORIGINS = new Set<string>([
  "https://www.obrent.de",
  "https://obrent.de",
  "https://obrent-fleet-showcase.lovable.app",
]);

const DEFAULT_ALLOWED = "https://obrent-fleet-showcase.lovable.app";

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : DEFAULT_ALLOWED;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function preflight(request: Request): Response {
  return new Response(null, { status: 200, headers: corsHeaders(request) });
}
