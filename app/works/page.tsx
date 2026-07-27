import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getContent, workHref } from "@/lib/content";
import { workSectionItems } from "@/lib/navigation";

export const metadata: Metadata = { title: "Works", alternates: { canonical: "/works" } };
export default function WorksPage() { const { works } = getContent(); return <SiteShell currentPath="/works" sectionItems={workSectionItems("/works")}><h1>Works</h1>{works.length === 0 ? <p className="empty-state">作品将在这里发布。</p> : <ul className="index-list">{works.map((work) => <li key={work.slug}><Link href={workHref(work.slug)}><h2>{work.title}</h2><p>{work.summary}</p></Link></li>)}</ul>}</SiteShell>; }
