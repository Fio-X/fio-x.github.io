import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsPageContent } from "@/app/news/page";
import { getNewsEntries } from "@/lib/news";
import { NEWS_PAGE_SIZE, pageCount, paginatedPathForParam, paginationParams, STATIC_EXPORT_PLACEHOLDER_PAGE } from "@/lib/pagination";

interface Props { params: Promise<{ page: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = (await params).page;
  const canonical = paginatedPathForParam("/news", page);
  return canonical ? { title: `News · ${page}`, alternates: { canonical } } : {};
}

export function generateStaticParams(): Array<{ page: string }> {
  return paginationParams(getNewsEntries().length, NEWS_PAGE_SIZE);
}

export default async function NewsPaginationPage({ params }: Props) {
  const pageParam = (await params).page;
  if (pageParam === STATIC_EXPORT_PLACEHOLDER_PAGE) notFound();
  const page = Number(pageParam);
  const entries = getNewsEntries();
  const totalPages = pageCount(entries.length, NEWS_PAGE_SIZE);
  if (!Number.isInteger(page) || page < 2 || page > totalPages) notFound();
  return <NewsPageContent page={page} entries={entries} />;
}
