import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_ORIGIN),
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
  openGraph: { siteName: SITE_NAME, type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html id="top" lang="zh-CN"><body>{children}</body></html>;
}
