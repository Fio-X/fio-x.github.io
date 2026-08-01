import type { Metadata } from "next";
import { Pagination } from "@/components/pagination";
import { NewsList } from "@/components/news-list";
import { SiteShell } from "@/components/site-shell";
import { getNewsEntries } from "@/lib/news";
import { newsSectionItems } from "@/lib/navigation";
import { NEWS_PAGE_SIZE, pageCount } from "@/lib/pagination";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "News", alternates: { canonical: sitePath("/news") } };

export default function NewsPage() { return <NewsPageContent page={1} />; }

export function NewsPageContent({ page, entries = getNewsEntries() }: { page: number; entries?: ReturnType<typeof getNewsEntries> }) {
  const totalPages = pageCount(entries.length, NEWS_PAGE_SIZE);
  const visibleEntries = entries.slice((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE);
  const currentPath = sitePath(page === 1 ? "/news" : `/news/page/${page}`);
  return <SiteShell currentPath={currentPath} sectionItems={newsSectionItems(currentPath)}>
    <h1 className="sr-only">News</h1>
    {visibleEntries.length === 0 ? <p className="empty-state">News 将在这里发布。</p> : <NewsList entries={visibleEntries} />}
    <Pagination basePath="/news" currentPage={page} pageCount={totalPages} label="News" />
  </SiteShell>;
}
