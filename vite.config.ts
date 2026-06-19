import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

// React must be bundled into the worker SSR output for production
// (otherwise "No such module assets/react" at runtime on Cloudflare), but
// in dev SSR Vite's ESM module runner cannot evaluate React's CJS entry
// ("module is not defined"). So gate the React bundling to build only.
export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  const reactBundle = isBuild
    ? ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]
    : [];
  const sharedNoExternal = [
    ...reactBundle,
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
  ];

  return {
    ssr: {
      noExternal: sharedNoExternal,
    },
    resolve: {
      noExternal: sharedNoExternal,
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
  };
});
