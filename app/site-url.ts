/**
 * The site's own origin, resolved at BUILD time — which is what keeps every
 * route static.
 *
 * Deriving the origin from `headers()` forces Next to render on every request:
 * the page cannot be prerendered, so it gives up full CDN caching and pays a
 * serverless invocation per visit. Nothing here varies by request, so that cost
 * would buy nothing.
 *
 * Order: an explicit NEXT_PUBLIC_SITE_URL wins (set it when a custom domain
 * lands); otherwise the production domain; otherwise localhost for `next dev`.
 *
 * A literal rather than Vercel's VERCEL_PROJECT_PRODUCTION_URL, because that
 * variable resolves to the per-deployment preview host — which would put
 * preview URLs into the Open Graph tags, canonical link, and sitemap of a
 * production build, and let preview deployments be indexed as the real site.
 */
const PRODUCTION_URL = "https://hill-sudani.vercel.app";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000");
