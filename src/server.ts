import baseServerEntry from "@tanstack/react-start/server-entry";
import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

async function normalizeCatastrophicSsrResponse(response: Response) {
  if (response.status < 500) return response;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  const looksLikeSwallowedError =
    body.includes('"unhandled":true') ||
    body.includes('"message":"HTTPError"') ||
    body.includes('"message":"Internal Server Error"');

  if (!looksLikeSwallowedError) return response;

  console.error(consumeLastCapturedError() ?? new Error(`SSR returned opaque 500 response: ${body}`));

  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const response = await baseServerEntry.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};