import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Advertiser-Genius | Smart TV Ad Carousel Management",
  description: "Create, manage, and display ad carousels on smart TVs in stores with Advertiser-Genius. Simplify your in-store advertising workflow.",
  keywords: "ad carousel, smart TV advertising, digital signage, in-store advertising, retail ads",
  authors: [{ name: "Advertiser-Genius Team" }],
  creator: "Advertiser-Genius",
  publisher: "Advertiser-Genius",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://advertiser-genius.com"),
  openGraph: {
    title: "Advertiser-Genius | Smart TV Ad Carousel Management",
    description: "Create, manage, and display ad carousels on smart TVs in stores. Simplify your in-store advertising workflow.",
    url: "https://advertiser-genius.com",
    siteName: "Advertiser-Genius",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Advertiser-Genius Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advertiser-Genius | Smart TV Ad Carousel Management",
    description: "Create, manage, and display ad carousels on smart TVs in stores. Simplify your in-store advertising workflow.",
    images: ["/images/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
