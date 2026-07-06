import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "ANCLA — Finanzas con Propósito",
        short_name: "ANCLA",
        description:
          "Acepta, Nombra, Comprende, Libérate, Avanza. La app que te acompaña a dejar de huir de tus deudas y empezar de nuevo, con honestidad.",
        theme_color: "#14171F",
        background_color: "#14171F",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        lang: "es",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // No cachear nunca llamadas a Firebase (Auth/Firestore) — esta app
        // depende de datos siempre frescos y de sesión en vivo; solo el
        // shell de la app (HTML/CSS/JS) se sirve desde caché para que
        // abra rápido e instalable, no para funcionar completamente offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.includes("firestore.googleapis.com") ||
              url.hostname.includes("identitytoolkit.googleapis.com"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
});
