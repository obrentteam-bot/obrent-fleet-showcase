import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// TanStack Start config tuned for Vercel static hosting.
// The app has no server functions — all backend calls go to Supabase
// directly from the browser using VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
// We render in SPA mode so Vercel only needs to serve static assets.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: {
        entry: "./src/server.ts",
      },
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
