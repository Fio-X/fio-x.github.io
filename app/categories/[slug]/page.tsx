import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { contentHref, getArticlesForCategory, getContent, STATIC_EXPORT_PLACEHOLDER_SLUG } from "@/lib/content";
import { archiveSectionItems } from "@/lib/navigation";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";
export async function generateStaticParams() {
  const slugs = getContent().categories;
  return (slugs.length > 0 ? slugs : [STATIC_EXPORT_PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> { const slug = (await params).slug; return getContent().categories.includes(slug) ? { title: slug, alternates: { canonical: `/categories/${encodeURIComponent(slug)}` } } : {}; }
export default async function CategoryPage({ params }: Props) {
  const slug = (await params).slug;
  const articles = getArticlesForCategory(slug);
  if (articles.length === 0) notFound();
  return <SiteShell currentPath="/archive" sectionItems={archiveSectionItems(`/categories/${encodeURIComponent(slug)}`)}><h1>{slug}</h1><ul className="index-list">{articles.map((article) => <li key={article.slug}><Link href={contentHref(article.slug)}><h2>{article.title}</h2><p>{article.description}</p></Link></li>)}</ul></SiteShell>;
}
