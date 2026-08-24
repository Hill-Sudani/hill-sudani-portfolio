import type { MetadataRoute } from "next";
import { siteUrl } from "./site-url";

/**
 * A single-page site, so the sitemap has exactly one entry. It still earns its
 * place: it is how a crawler learns the canonical origin and that the page is
 * the site's root rather than one of several equal candidates.
 *
 * `lastModified` is the build time. That is honest — a rebuild is the only way
 * content here changes, since the page is fully prerendered.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
