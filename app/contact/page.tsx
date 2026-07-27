import type { Metadata } from "next";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getPage } from "@/lib/content";
import { pageSectionItems } from "@/lib/navigation";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };
export default function ContactPage() { const page = getPage("contact"); const sectionIds = Object.fromEntries(page?.sections.map((section) => [section.label, section.id]) ?? []); return <SiteShell currentPath="/contact" sectionItems={pageSectionItems(page)}><h1>{page?.title ?? "Contact"}</h1>{page ? <ContentBody sectionIds={sectionIds}>{page.body}</ContentBody> : <p className="empty-state">联系信息将在这里发布。</p>}</SiteShell>; }
