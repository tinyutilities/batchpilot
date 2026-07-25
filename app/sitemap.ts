import type { MetadataRoute } from "next";

const BASE_URL = "https://batchpilot.tinyutility.space";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, priority: 1 },
    { url: `${BASE_URL}/auth/login`, priority: 0.5 },
    { url: `${BASE_URL}/auth/signup`, priority: 0.5 },
  ];
}
