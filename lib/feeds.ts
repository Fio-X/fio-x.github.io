import { articleHref, type Article, type ContentCollection } from "./content";
import { NEWS_PAGE_SIZE, pageCount, PUBLICATIONS_PAGE_SIZE } from "./pagination";
import { getNewsEntries, type NewsEntry } from "./news";
import { sitePath } from "./site-constants";

export function renderRss({ entries, articles, siteName, siteDescription, siteOrigin }: { entries?: readonly NewsEntry[]; articles?: readonly Article[]; siteName: string; siteDescription: string; siteOrigin: string }) {
  const feedEntries = entries ?? articles?.map((article) => ({ id: `information:${article.slug}`, source: "article" as const, category: "News" as const, title: article.title, date: article.updated ?? article.date, description: article.description, href: articleHref(article) })) ?? getNewsEntries();
  const items = feedEntries.map((entry) => `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${siteOrigin}${sitePath(entry.href)}</link>
      <guid isPermaLink="true">${siteOrigin}${sitePath(entry.href)}</guid>
      <description>${escapeXml(entry.description ?? "")}</description>
      <pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${escapeXml(siteName)}</title><link>${siteOrigin}${sitePath("/")}</link><description>${escapeXml(siteDescription)}</description><language>zh-CN</language><atom:link href="${siteOrigin}/rss.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>${items}
</channel></rss>`;
}

export function sitemapPaths(content: ContentCollection, options: { hasInformationPage?: boolean; hasBiography?: boolean; hasContact?: boolean } = {}) {
  const entries = getNewsEntries();
  const articlePaths = content.articles.map((article) => sitePath(`/information/${article.slug}`));
  const workPaths = content.works.map((work) => sitePath(`/works/${work.slug}`));
  const publicationPaths = content.publications.map((publication) => sitePath(`/publications/${publication.slug}`));
  const newsPages = Array.from({ length: pageCount(entries.length, NEWS_PAGE_SIZE) - 1 }, (_, index) => sitePath(`/news/page/${index + 2}`));
  const publicationPages = Array.from({ length: pageCount(content.publications.length, PUBLICATIONS_PAGE_SIZE) - 1 }, (_, index) => sitePath(`/publications/page/${index + 2}`));
  return [
    sitePath("/"), sitePath("/news"), ...newsPages,
    sitePath("/information"), sitePath("/information/type/essay"), sitePath("/information/type/image-notes"), sitePath("/information/type/conversation"),
    ...(content.works.length ? [sitePath("/works")] : []), ...(content.publications.length ? [sitePath("/publications"), ...publicationPages] : []),
    ...(options.hasBiography ? [sitePath("/biography")] : []), ...(options.hasContact ? [sitePath("/contact")] : []),
    ...articlePaths, ...workPaths, ...publicationPaths,
  ];
}

export function renderSitemap(paths: string[], siteOrigin: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(paths)].filter((path) => !path.includes("__static-export-placeholder__") && !path.startsWith("/articles") && !path.startsWith("/archive") && !path.startsWith("/about")).sort().map((path) => `  <url><loc>${escapeXml(`${siteOrigin}${sitePath(path)}`)}</loc></url>`).join("\n")}
</urlset>`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
