import type { Metadata } from "next";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getPage } from "@/lib/content";
import { pageSectionItems } from "@/lib/navigation";

export const metadata: Metadata = { title: "Biography", alternates: { canonical: "/biography" } };
export default function BiographyPage() { const page = getPage("biography"); const sectionIds = Object.fromEntries(page?.sections.map((section) => [section.label, section.id]) ?? []); return <SiteShell currentPath="/biography" sectionItems={pageSectionItems(page)}><h1>{page?.title ?? "Biography"}</h1>{page ? <ContentBody sectionIds={sectionIds}>{page.body}</ContentBody> : <p className="empty-state">履历将在这里发布。</p>}</SiteShell>; }
