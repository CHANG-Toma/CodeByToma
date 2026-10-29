import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/demo/",
          "/api/",
          ...(process.env.DASHBOARD_BASE_PATH
            ? [`/${process.env.DASHBOARD_BASE_PATH.replace(/^\/+|\/+$/g, "")}`]
            : []),
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
