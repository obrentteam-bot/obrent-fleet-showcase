import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  resolve: {
    // TanStack Start's server runtime pulls in h3-v2, which in turn depends on
    // rou3/srvx. On the published worker these must be bundled, otherwise the
    // server chunk tries to import runtime modules like `assets/rou3` and every
    // request fails with HTTP 500 before route handlers (including CORS) run.
    noExternal: ["h3-v2", "rou3", "srvx"],
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
