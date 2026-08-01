import Link from "next/link";
import { pagePath } from "@/lib/pagination";

export function Pagination({ basePath, currentPage, pageCount, label }: { basePath: string; currentPage: number; pageCount: number; label: string }) {
  if (pageCount <= 1) return null;
  const href = (page: number) => pagePath(basePath, page);
  return <nav className="pagination" aria-label={`${label} 分页`}>
    {currentPage > 1 && <Link href={href(currentPage - 1)} aria-label="上一页">←</Link>}
    {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => page === currentPage ? <span key={page} aria-current="page">{page}</span> : <Link key={page} href={href(page)}>{page}</Link>)}
    {currentPage < pageCount && <Link href={href(currentPage + 1)} aria-label="下一页">→</Link>}
  </nav>;
}
