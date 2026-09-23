import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard",
    name: "BatchPilot · Navigate Every Batch",
    short_name: "BatchPilot",
    description:
      "Navigate every batch — students, attendance, fees and marks — from one modern dashboard built for teachers.",
    // The installed icon should reopen straight into the app, not the
    // marketing landing page — middleware still redirects to /auth/login
    // if the session has expired, so this doesn't bypass auth.
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    // Not locked to portrait: the dashboard's tables are used in landscape
    // on tablets too, so the app should follow whatever orientation the
    // device is already in rather than forcing a rotation.
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    categories: ["education", "productivity", "business"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      // Placeholder entries — see public/icons/README.md for the exact
      // files this configuration expects. Until real PNGs are dropped in,
      // Chrome/Android installability checks will not fully pass.
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
