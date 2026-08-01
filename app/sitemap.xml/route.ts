import { getContent } from "@/lib/content";
import { renderSitemap, sitemapPaths } from "@/lib/feeds";
import { SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";
export async function GET() {
  const paths = sitemapPaths(getContent(), { hasBiography: true, hasContact: true });
  const xml = renderSitemap(paths, SITE_ORIGIN);
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
