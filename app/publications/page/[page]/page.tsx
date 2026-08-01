import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicationsPageContent } from "@/app/publications/page";
import { getContent } from "@/lib/content";
import { pageCount, paginatedPathForParam, PUBLICATIONS_PAGE_SIZE, paginationParams, STATIC_EXPORT_PLACEHOLDER_PAGE } from "@/lib/pagination";

interface Props { params: Promise<{ page: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = (await params).page;
  const canonical = paginatedPathForParam("/publications", page);
  return canonical ? { title: `Publications · ${page}`, alternates: { canonical } } : {};
}

export function generateStaticParams(): Array<{ page: string }> {
  return paginationParams(getContent().publications.length, PUBLICATIONS_PAGE_SIZE);
}

export default async function PublicationsPaginationPage({ params }: Props) {
  const pageParam = (await params).page;
  if (pageParam === STATIC_EXPORT_PLACEHOLDER_PAGE) notFound();
  const page = Number(pageParam);
  const publications = getContent().publications;
  const totalPages = pageCount(publications.length, PUBLICATIONS_PAGE_SIZE);
  if (!Number.isInteger(page) || page < 2 || page > totalPages) notFound();
  return <PublicationsPageContent page={page} />;
}
