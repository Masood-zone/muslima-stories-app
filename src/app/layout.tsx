import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muslima Stories | A little library of big lessons",
  description: "Explore thirteen illustrated stories by Muslima Acheampong.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
