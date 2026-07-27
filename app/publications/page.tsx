import type { Metadata } from "next";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getPage } from "@/lib/content";
import { pageSectionItems } from "@/lib/navigation";

export const metadata: Metadata = { title: "Publications", alternates: { canonical: "/publications" } };
export default function PublicationsPage() { const page = getPage("publications"); const sectionIds = Object.fromEntries(page?.sections.map((section) => [section.label, section.id]) ?? []); return <SiteShell currentPath="/publications" sectionItems={pageSectionItems(page)}><h1>{page?.title ?? "Publications"}</h1>{page ? <ContentBody sectionIds={sectionIds}>{page.body}</ContentBody> : <p className="empty-state">出版物将在这里发布。</p>}</SiteShell>; }
