import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { categoryHref, getArticleBySlug, getContent, STATIC_EXPORT_PLACEHOLDER_SLUG, tagHref } from "@/lib/content";
import { articleSectionItems, archiveSectionItems } from "@/lib/navigation";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";
export async function generateStaticParams() {
  const slugs = getContent().articles.map((article) => article.slug);
  return (slugs.length > 0 ? slugs : [STATIC_EXPORT_PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug((await params).slug);
  return article ? { title: article.title, description: article.description, alternates: { canonical: `/articles/${article.slug}` } } : {};
}

export default async function ArticlePage({ params }: Props) {
  const article = getArticleBySlug((await params).slug);
  if (!article) notFound();
  const sectionItems = article.section === "articles" ? articleSectionItems("articles", `/articles/${article.slug}`) : archiveSectionItems();
  return <SiteShell currentPath={article.section === "articles" ? "/articles" : "/archive"} sectionItems={sectionItems}><article><h1>{article.title}</h1>{article.cover && (
    // Static export serves public media directly; default next/image optimization needs a server loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img className="cover-image" src={article.cover} alt="" />
  )}
    <div className="content-meta"><time dateTime={article.date}>{article.date}</time>{article.updated && <time dateTime={article.updated}>updated {article.updated}</time>}</div>
    <nav aria-label="文章分类和标签" className="taxonomy"><Link href={categoryHref(article.category)}>{article.category}</Link>{article.tags.map((tag) => <Link key={tag} href={tagHref(tag)}>#{tag}</Link>)}</nav>
    <ContentBody>{article.body}</ContentBody><nav className="taxonomy" aria-label="返回目录"><Link href="/archive">返回目录</Link></nav></article></SiteShell>;
}
