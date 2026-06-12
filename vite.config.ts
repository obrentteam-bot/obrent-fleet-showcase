import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  ssr: {
    // h3-v2 is an npm alias (h3@2.x) used by @tanstack/start-server-core.
    // The deploy worker bundler cannot resolve the alias at runtime, so it
    // must be inlined into the server bundle.
    noExternal: ["h3-v2"],
  },
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
