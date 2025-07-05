import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import vitePluginInjectDataLocator from "./plugins/vite-plugin-inject-data-locator";

// https://vite.dev/config/
export default defineConfig({
  base: "/invoice/",
  plugins: [
    react(),
    vitePluginInjectDataLocator(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"], // Assuming vite.svg is in public folder, or adjust path
      manifest: {
        name: "Invoice Generator",
        short_name: "InvoiceApp",
        description: "An application to create, manage, and export invoices.",
        theme_color: "#ffffff", // Example theme color, can be adjusted
        background_color: "#ffffff", // Example background color
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "vite.svg", // Using existing vite.svg as a placeholder
            sizes: "any",    // 'any' is suitable for SVGs that can scale
            type: "image/svg+xml",
          },
          {
            src: "pwa-192x192.png", // Placeholder: user needs to create this in public/
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png", // Placeholder: user needs to create this in public/
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png", // Maskable icon placeholder
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA features in development
      },
    }),
  ],
});