import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Hack-Nation 2026 — Connex Field offline shell (registered only via src/pwa/registerSW.ts)
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      includeAssets: ["favicon.ico", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        id: "/field",
        name: "Connex Field",
        short_name: "Connex Field",
        description: "Offline AI for rural carbon-market access",
        start_url: "/field",
        scope: "/",
        display: "standalone",
        background_color: "#0c1016",
        theme_color: "#0c1016",
        lang: "en",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache only the local app shell and essential local assets.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        // Navigations go through NetworkFirst below (never cache-first HTML).
        navigateFallback: null,
        runtimeCaching: [
          {
            // Same-origin page navigations, excluding OAuth technical routes.
            urlPattern: ({ request, url, sameOrigin }) =>
              sameOrigin && request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "connex-field-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20 },
              plugins: [
                {
                  // Offline fallback to the precached application shell.
                  // Runs inside the service worker, where `caches` exists (node typings lack it).
                  handlerDidError: async () =>
                    (await (globalThis as unknown as { caches: { match: (k: string) => Promise<Response | undefined> } }).caches.match("/index.html")) ?? Response.error(),
                },
              ],
            },
          },
          // No rule for Supabase / Lovable Cloud, auth, Edge Functions, AI APIs or
          // database calls: cross-origin requests are never matched, so never cached.
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
