import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { articleHref, getArticlesForTag, getContent, getWorksForTag, staticSlugParams, workHref } from "@/lib/content";
import { aggregationContext } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";
export async function generateStaticParams() {
  const slugs = getContent().tags;
  return staticSlugParams(slugs);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> { const slug = (await params).slug; return getContent().tags.includes(slug) ? { title: `#${slug}`, alternates: { canonical: sitePath(`/tags/${encodeURIComponent(slug)}`) } } : {}; }
export default async function TagPage({ params }: Props) {
  const slug = (await params).slug;
  const articles = getArticlesForTag(slug);
  const works = getWorksForTag(slug);
  if (articles.length === 0 && works.length === 0) notFound();
  return <SiteShell currentPath={aggregationContext(articles.map((article) => article.section), works.length > 0)}><h1 className="page-title">#{slug}</h1><ul className="news-list">{articles.map((article) => <li className="news-item" key={`article-${article.slug}`}><div className="news-copy"><p className="eyebrow">{article.category}</p><h2><Link href={articleHref(article)}>{article.title}</Link></h2><p>{article.date}</p><p>{article.description}</p></div></li>)}{works.map((work) => <li className="news-item" key={`work-${work.slug}`}><div className="news-copy"><p className="eyebrow">{work.kind}</p><h2><Link href={workHref(work.slug)}>{work.title}</Link></h2><p>{work.date}</p><p>{work.summary}</p></div></li>)}</ul></SiteShell>;
}
