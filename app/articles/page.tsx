import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { contentHref, getArticlesForSection } from "@/lib/content";
import { articleSectionItems } from "@/lib/navigation";

export const metadata: Metadata = { title: "Articles", alternates: { canonical: "/articles" } };
export default function ArticlesPage() { const articles = getArticlesForSection("articles"); return <SiteShell currentPath="/articles" sectionItems={articleSectionItems("articles", "/articles")}><h1>Articles</h1>{articles.length === 0 ? <p className="empty-state">文章将在这里发布。</p> : <ul className="index-list">{articles.map((article) => <li key={article.slug}><Link href={contentHref(article.slug)}><h2>{article.title}</h2><p>{article.description}</p></Link></li>)}</ul>}</SiteShell>; }
