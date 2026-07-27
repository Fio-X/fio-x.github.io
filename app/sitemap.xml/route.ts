import { categoryHref, contentHref, getContent, tagHref, workHref } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";

export const dynamic = "force-static";
export async function GET() {
  const { articles, works, categories, tags } = getContent();
  const paths = ["/", "/archive", "/information", "/biography", "/works", "/publications", "/articles", "/contact", ...articles.map((article) => contentHref(article.slug)), ...works.map((work) => workHref(work.slug)), ...categories.map(categoryHref), ...tags.map(tagHref)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.sort().map((path) => `  <url><loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc></url>`).join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
function escapeXml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
