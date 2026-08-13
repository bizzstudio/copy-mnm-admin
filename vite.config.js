// vite.config.js
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { VitePWA } from "vite-plugin-pwa";
import compression from "vite-plugin-compression2";

import dns from "dns";
import path from "path";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  build: {
    outDir: "dist", // Set the output directory for the build files
    assetsDir: "@/assets", // Set the directory for the static assets
    // sourcemap: process.env.__DEV__ === "true",
    rollupOptions: {
      // Additional Rollup configuration options if needed
    },
    chunkSizeWarningLimit: 10 * 1024,
  },
  plugins: [
    react(),
    cssInjectedByJsPlugin(),

    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        // enabled: process.env.SW_DEV === "true",
        enabled: false,
        /* when using generateSW the PWA plugin will switch to classic */
        type: "module",
        navigateFallback: "index.html",
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      // add this to cache all the
      // // static assets in the public folder
      // includeAssets: ["**/*"],
      includeAssets: [
        "**/*",
        "src/assets/img/logo/*.png",
        "src/assets/img/*.png",
        "src/assets/img/*.jepg",
        "src/assets/img/*.webp",
        "favicon.ico",
      ],
      manifest: [
        {
          theme_color: "#2f4bb5",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: ".",
          start_url: ".",
          id: ".",
          short_name: "BizzExpo",
          name: "BizzExpo",
          description:
            "BizzExpo",
          icons: [
            {
              src: "/bizzexpo-icon.svg",
              sizes: "any",
              type: "image/svg+xml",
            },
            {
              src: "/bizzexpo-icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/bizzexpo-icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      ],
    }),
    compression(),
  ],

  server: {
    proxy: {
      "/api/": {
        target: process.env.VITE_APP_API_SOCKET_URL,
        changeOrigin: true,
      },
    },
  },

  resolve: {
    /**
     * ONE React, however many packages ask for it.
     *
     * `@bizzexpo/shared` is linked with `file:../bizzexpo-shared`, and that
     * directory has its own `node_modules/react` (React is a devDependency there
     * so the package can build and test itself). Without this line the bundle
     * ends up with TWO copies: the app's, and the one reached through the link.
     *
     * React keeps the state of the currently-rendering component in a module
     * level variable, so a hook called from the second copy reads a dispatcher
     * that is `null` — which surfaces as
     *
     *     Cannot read properties of null (reading 'useId')
     *
     * and a blank page. The message names a hook and points at the shared
     * package, so it reads like a bug in that component; it is not. Nothing is
     * wrong with the code on either side, only with there being two Reacts.
     */
    dedupe: ["react", "react-dom"],
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src/"),
    },
  },
  test: {
    global: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTest.js"],
  },
});
