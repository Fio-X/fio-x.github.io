import type { Metadata } from "next";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getPage } from "@/lib/content";
import { pageSectionItems } from "@/lib/navigation";

export const metadata: Metadata = { title: "Information", alternates: { canonical: "/information" }, robots: { index: false, follow: true } };
export default function AboutPage() { const page = getPage("information"); const sectionIds = Object.fromEntries(page?.sections.map((section) => [section.label, section.id]) ?? []); return <SiteShell currentPath="/information" sectionItems={pageSectionItems(page)}><h1>{page?.title ?? "Information"}</h1>{page ? <ContentBody sectionIds={sectionIds}>{page.body}</ContentBody> : <p className="empty-state">信息将在这里发布。</p>}</SiteShell>; }
