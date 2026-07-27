import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { contentHref, getContent } from "@/lib/content";
import { archiveSectionItems } from "@/lib/navigation";

export const metadata: Metadata = { title: "Latest", alternates: { canonical: "/archive" } };
export default function ArchivePage() { const { articles } = getContent(); return <SiteShell currentPath="/archive" sectionItems={archiveSectionItems("/archive")}><h1>Latest</h1>{articles.length === 0 ? <p className="empty-state">新闻将在这里发布。</p> : <ul className="index-list">{articles.map((article) => <li key={article.slug}><Link href={contentHref(article.slug)}><h2>{article.title}</h2><p>{article.description}</p><span className="content-meta">{article.date}</span></Link></li>)}</ul>}</SiteShell>; }
