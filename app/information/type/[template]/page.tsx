import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InformationIndex } from "@/components/information-index";
import { SiteShell } from "@/components/site-shell";
import { ARTICLE_TEMPLATES, getContent, type ArticleTemplate } from "@/lib/content";
import { informationSectionItems } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

interface Props { params: Promise<{ template: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() { return ARTICLE_TEMPLATES.map((template) => ({ template })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const template = (await params).template; return ARTICLE_TEMPLATES.includes(template as ArticleTemplate) ? { title: `Information · ${template}`, alternates: { canonical: sitePath(`/information/type/${template}`) } } : {}; }
export default async function InformationTemplatePage({ params }: Props) {
  const template = (await params).template;
  if (!ARTICLE_TEMPLATES.includes(template as ArticleTemplate)) notFound();
  const articles = getContent().articles.filter((article) => article.template === template);
  return <SiteShell currentPath={sitePath(`/information/type/${template}`)} sectionItems={informationSectionItems(sitePath(`/information/type/${template}`), template as ArticleTemplate)}><InformationIndex articles={articles} /></SiteShell>;
}
