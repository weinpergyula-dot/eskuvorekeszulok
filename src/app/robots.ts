import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/profil", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://eskuvorekeszulok.hu/sitemap.xml",
  };
}
