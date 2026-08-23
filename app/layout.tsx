import type { Metadata } from "next";
import { headers } from "next/headers";
import "geist/font/sans";
import "geist/font/mono";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const title = "Hill Sudani | Software Engineer, ML & Quant Research";
  const description =
    "Four projects, one line of work: from a hand-derived gradient to a circuit inside a pretrained model. ML systems, quantitative research, and performance engineering.";

  return {
    metadataBase: new URL(origin),
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
      url: origin,
      images: [
        {
          url: `${origin}/og.png`,
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
      images: [`${origin}/og.png`],
    },
  };
}

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
