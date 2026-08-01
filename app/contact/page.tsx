import type { Metadata } from "next";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getPage, hasPageContent } from "@/lib/content";
import { pageSectionItems } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: sitePath("/contact") } };

export default function ContactPage() {
  const page = getPage("contact");
  const visiblePage = hasPageContent(page) ? page : undefined;
  const sectionIds = Object.fromEntries(visiblePage?.sections.map((section) => [section.label, section.id]) ?? []);
  return <SiteShell currentPath={sitePath("/contact")} sectionItems={pageSectionItems(visiblePage)}><article className="contact"><h1 className="page-title">{visiblePage?.title ?? "Contact"}</h1>{visiblePage ? <ContentBody sectionIds={sectionIds}>{visiblePage.body}</ContentBody> : <p className="empty-state">联系信息将在这里发布。</p>}</article></SiteShell>;
}
