import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InformationArticle } from "@/components/information-article";
import { SiteShell } from "@/components/site-shell";
import { getArticleBySlug, getContent, staticSlugParams } from "@/lib/content";
import { informationSectionItems } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() { return staticSlugParams(getContent().articles.map((article) => article.slug)); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug((await params).slug);
  return article ? { title: article.title, description: article.description, alternates: { canonical: sitePath(`/information/${article.slug}`) } } : {};
}

export default async function InformationArticlePage({ params }: Props) {
  const article = getArticleBySlug((await params).slug);
  if (!article) notFound();
  return <SiteShell currentPath={sitePath("/information")} sectionItems={informationSectionItems(sitePath(`/information/${article.slug}`), article.template)}><InformationArticle article={article} /></SiteShell>;
}
