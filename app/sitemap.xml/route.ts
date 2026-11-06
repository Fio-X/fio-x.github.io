import { getContent, getPage, hasPageContent } from "@/lib/content";
import { renderSitemap, sitemapPaths } from "@/lib/feeds";
import { SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";
export async function GET() {
  // Fixed pages without public content only show a placeholder, so they stay out of the sitemap.
  const paths = sitemapPaths(getContent(), { hasBiography: hasPageContent(getPage("biography")), hasContact: hasPageContent(getPage("contact")) });
  const xml = renderSitemap(paths, SITE_ORIGIN);
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
