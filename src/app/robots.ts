import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // User-generated pages (/quiz, /result) stay crawlable so link-preview bots (WhatsApp, X, Facebook)
        // can fetch their Open Graph images; they are excluded from search via noindex instead.
        disallow: ["/api/", "/dashboard/", "/admin", "/me", "/offline"],
      },
      // AdSense's crawler must be able to see every page that can show ads.
      { userAgent: "Mediapartners-Google", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
