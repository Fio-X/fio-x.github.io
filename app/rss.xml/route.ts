import { renderRss } from "@/lib/feeds";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const xml = renderRss({ siteName: SITE_NAME, siteDescription: SITE_DESCRIPTION, siteOrigin: SITE_ORIGIN });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
