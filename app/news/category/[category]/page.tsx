import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsList } from "@/components/news-list";
import { SiteShell } from "@/components/site-shell";
import { NEWS_CATEGORIES } from "@/lib/content";
import { categorySlug, newsSectionItems } from "@/lib/navigation";
import { getNewsEntries } from "@/lib/news";
import { sitePath } from "@/lib/site-constants";

interface Props { params: Promise<{ category: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() { return NEWS_CATEGORIES.map((category) => ({ category: categorySlug(category) })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const category = (await params).category; return { title: `News · ${category}`, alternates: { canonical: sitePath(`/news/category/${category}`) } }; }
export default async function NewsCategoryPage({ params }: Props) {
  const category = (await params).category;
  const label = NEWS_CATEGORIES.find((value) => categorySlug(value) === category);
  if (!label) notFound();
  const entries = getNewsEntries().filter((entry) => entry.category === label);
  return <SiteShell currentPath={sitePath(`/news/category/${category}`)} sectionItems={newsSectionItems(sitePath(`/news/category/${category}`))}><h1 className="sr-only">{label}</h1>{entries.length === 0 ? <p className="empty-state">{label} 将在这里发布。</p> : <NewsList entries={entries} />}</SiteShell>;
}
