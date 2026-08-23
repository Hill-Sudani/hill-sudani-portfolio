import type { Metadata } from "next";
import "geist/font/sans";
import "geist/font/mono";
import "./globals.css";

/**
 * Resolved at build time, which is what keeps this page STATIC.
 *
 * Deriving the origin from `headers()` forces Next to render the route on every
 * request — the page cannot be prerendered, so it gives up full CDN caching and
 * pays a serverless invocation per visit. Nothing on this site varies by
 * request, so that cost bought nothing.
 *
 * Order: an explicit NEXT_PUBLIC_SITE_URL wins; otherwise Vercel's production
 * domain; otherwise localhost for `next dev`.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Hill Sudani | Software Engineer, ML & Quant Research";
const description =
  "Four projects, one line of work: from a hand-derived gradient to a circuit inside a pretrained model. ML systems, quantitative research, and performance engineering.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: [{ url: "/icon.svg?v=3", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/icon.svg?v=3",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1200,
        height: 630,
        alt: "Hill Sudani, software engineering, ML systems, and quant research portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
