import type { Metadata } from "next";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { SiteShell } from "@/components/site-shell";
import { getContent } from "@/lib/content";
import { pageCount, PUBLICATIONS_PAGE_SIZE } from "@/lib/pagination";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "Publications", alternates: { canonical: sitePath("/publications") } };
export default function PublicationsPage() {
  return <PublicationsPageContent page={1} />;
}

export function PublicationsPageContent({ page }: { page: number }) {
  const publications = getContent().publications;
  const totalPages = pageCount(publications.length, PUBLICATIONS_PAGE_SIZE);
  const entries = publications.slice((page - 1) * PUBLICATIONS_PAGE_SIZE, page * PUBLICATIONS_PAGE_SIZE);
  return <SiteShell currentPath={sitePath("/publications")}><h1 className="page-title">Publications</h1>
    {entries.length === 0 ? <p className="empty-state">出版物将在这里发布。</p> : <ol className="grid">{entries.map((publication) => <li key={publication.slug}>
      <Link href={sitePath(`/publications/${publication.slug}`)} className="publication-item">
        {publication.cover ? <>
          {/* Static export serves public media directly; the default image optimizer needs a server loader. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="publication-cover" src={publication.cover} alt={publication.coverAlt ?? `${publication.title} cover`} />
        </> : <span className="publication-cover" aria-hidden="true" />}
        <div className="item-text"><h2>{publication.title}</h2><p>{publication.date.slice(0, 4)}{publication.publisher ? ` · ${publication.publisher}` : ""}</p></div>
      </Link>
    </li>)}</ol>}
    <Pagination basePath="/publications" currentPage={page} pageCount={totalPages} label="Publications" />
  </SiteShell>;
}
