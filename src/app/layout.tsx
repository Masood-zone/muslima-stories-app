import type { Metadata } from "next";
import bannerImage from "./assets/banner.png";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://muslima-stories-reader.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Muslima Stories | A little library of big lessons",
  description: "Explore thirteen illustrated stories by Muslima Acheampong.",
  applicationName: "Muslima Stories Reader",
  keywords: [
    "Muslima Acheampong",
    "stories",
    "library",
    "illustrated stories",
    "reading",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Muslima Stories",
    description: "A little library of big lessons from Muslima Acheampong.",
    siteName: "Muslima Stories",
    images: [
      {
        url: bannerImage.src,
        width: 1200,
        height: 630,
        alt: "Muslima Stories banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muslima Stories",
    description: "A little library of big lessons from Muslima Acheampong.",
    images: [bannerImage.src],
  },
  icons: {
    icon: "/favicon-32x32.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
