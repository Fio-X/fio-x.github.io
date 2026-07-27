import { contentHref, getContent } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const { articles } = getContent();
  const items = articles.map((article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_ORIGIN}${contentHref(article.slug)}</link>
      <guid isPermaLink="true">${SITE_ORIGIN}${contentHref(article.slug)}</guid>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${new Date(`${article.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${escapeXml(SITE_NAME)}</title><link>${SITE_ORIGIN}</link><description>${escapeXml(SITE_DESCRIPTION)}</description><language>zh-CN</language>${items}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
