import type { Metadata } from "next";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getPage, hasPageContent } from "@/lib/content";
import { pageSectionItems } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "Biography", alternates: { canonical: sitePath("/biography") } };

export default function BiographyPage() {
  const page = getPage("biography");
  const visiblePage = hasPageContent(page) ? page : undefined;
  const sectionIds = Object.fromEntries(visiblePage?.sections.map((section) => [section.label, section.id]) ?? []);
  const sections = visiblePage?.sections ?? [];
  return <SiteShell currentPath={sitePath("/biography")} sectionItems={pageSectionItems(visiblePage)}><article className="bio">
    <h1 className="page-title">{visiblePage?.title ?? "Biography"}</h1>
    {visiblePage ? <>
      {visiblePage.description && <p className="bio-intro">{visiblePage.description}</p>}
      {visiblePage.timeline.length > 0 ? sections.map((section) => <section className="bio-section" id={section.id} key={section.id}><h2>{section.label}</h2><ul className="timeline">{visiblePage.timeline.filter((entry) => entry.section === section.id || entry.section === section.label).map((entry, index) => <li key={`${entry.year}-${index}`}><time>{entry.year}</time><span>{entry.text}</span></li>)}</ul></section>) : <ContentBody sectionIds={sectionIds}>{visiblePage.body}</ContentBody>}
    </> : <p className="empty-state">履历将在这里发布。</p>}
  </article></SiteShell>;
}
