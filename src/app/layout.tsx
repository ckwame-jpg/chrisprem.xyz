import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StarfieldCanvas } from "@/components/cosmos/StarfieldCanvas";
import { ShootingStars } from "@/components/cosmos/ShootingStars";
import { CursorEffects } from "@/components/cosmos/CursorEffects";
import { GITHUB_URL, LINKEDIN_URL, SITE_URL } from "@/lib/os/links";

// Falls back to the production domain (not localhost) so OG/robots/
// sitemap URLs are correct even when the env var is missing.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

const sansFont = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const monoFont = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Chris Prempeh · Software Engineer",
  description:
    "Software engineer building end-to-end systems in Python, FastAPI, TypeScript, and Next.js. The site is the portfolio piece: a working terminal, live architecture diagrams, real telemetry, and an API-shaped contact form.",
  openGraph: {
    title: "Chris Prempeh · Software Engineer",
    description:
      "The site is the portfolio piece - a working terminal, live architecture diagrams, and an API-shaped contact form.",
    url: siteUrl,
    siteName: "chrisprem.xyz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Chris Prempeh",
  url: SITE_URL,
  jobTitle: "Software Engineer",
  sameAs: [GITHUB_URL, LINKEDIN_URL],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sansFont.variable} ${monoFont.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <StarfieldCanvas />
        <ShootingStars />
        <CursorEffects />
        {children}
      </body>
    </html>
  );
}
