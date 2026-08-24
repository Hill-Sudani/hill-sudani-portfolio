import type { MetadataRoute } from "next";
import { siteUrl } from "./site-url";

/**
 * Emitted as a static /robots.txt at build time.
 *
 * The sitemap line is absolute because crawlers require it to be, and it points
 * at whichever origin the build resolved — so a preview build never advertises
 * the production sitemap, or the reverse.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
