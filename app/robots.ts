import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The dashboard and admin section are authenticated, private
      // workspaces — nothing behind login is meaningful to index.
      disallow: ["/dashboard", "/admin"],
    },
    sitemap: "https://batchpilot.tinyutility.space/sitemap.xml",
  };
}
