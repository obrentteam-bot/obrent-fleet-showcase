import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  ssr: {
    noExternal: [
      "h3-v2",
      "rou3",
      "srvx",
      "cookie-es",
      "@tanstack/history",
      "@tanstack/router-core",
      "@tanstack/react-router",
      "@tanstack/react-start",
      "@tanstack/react-start-client",
      "@tanstack/react-start-server",
      "@tanstack/start-client-core",
      "@tanstack/start-server-core",
      "@tanstack/start-plugin-core",
      "seroval",
      "seroval-plugins",
      "seroval-plugins/web",
    ],
  },
  resolve: {
    // TanStack Start's server runtime pulls in h3-v2, which in turn depends on
    // rou3/srvx. On the published worker these must be bundled, otherwise the
    // server chunk tries to import runtime modules like `assets/rou3` and every
    // request fails with HTTP 500 before route handlers (including CORS) run.
    // Keep the same list here as a belt-and-braces hint for the dev/runtime
    // pipeline, but the actual Worker SSR bundling is controlled by ssr.noExternal.
    noExternal: [
      "h3-v2",
      "rou3",
      "srvx",
      "@tanstack/history",
      "@tanstack/router-core",
      "@tanstack/react-router",
      "@tanstack/react-start",
      "@tanstack/react-start-client",
      "@tanstack/react-start-server",
      "@tanstack/start-client-core",
      "@tanstack/start-server-core",
      "@tanstack/start-plugin-core",
      "seroval",
    ],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          outputPath: "/index",
        },
      },
    }),
    viteReact(),
  ],
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
  },
});
