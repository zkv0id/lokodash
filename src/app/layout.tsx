import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const SITE_NAME = "CC205 Wheel Watch";
const SITE_TITLE =
  "Data Pantauan Roda Lokomotif CC205 | Kampung Durian Runtuh";
const SITE_DESCRIPTION =
  "Dashboard pemantauan keausan roda lokomotif CC205: status Urgent, Warning, Normal, Invalid, action status, estimasi lifetime, tren parameter, dan prioritas reprofile untuk Depo Lokomotif Kampung Durian Runtuh, Divisi Regional IV.";

function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!raw) return new URL("http://localhost:3000");
  return new URL(raw.startsWith("http") ? raw : `https://${raw}`);
}

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "zkvoid" }],
  creator: "zkvoid",
  publisher: "zkvoid",
  keywords: [
    "CC205",
    "wheelset",
    "roda lokomotif",
    "KAI",
    "Danantara",
    "Kampung Durian Runtuh",
    "Divisi Regional IV",
    "monitoring roda",
    "flange thickness",
    "flange height",
    "diameter roda",
    "reprofile",
    "maintenance lokomotif",
  ],
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: "CC205 Watch",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070b14",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
