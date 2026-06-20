import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ferreteria.local";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/mi-cuenta/", "/mi-cuenta-empresa/"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
