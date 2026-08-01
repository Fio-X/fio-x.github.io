import type { Metadata } from "next";
import { InformationIndex } from "@/components/information-index";
import { SiteShell } from "@/components/site-shell";
import { getContent, getPage } from "@/lib/content";
import { informationSectionItems } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "Information", alternates: { canonical: sitePath("/information") } };

export default function InformationPage() {
  const { articles } = getContent();
  return <SiteShell currentPath={sitePath("/information")} sectionItems={informationSectionItems(sitePath("/information"), undefined, getPage("information"))}>
    <InformationIndex articles={articles} />
  </SiteShell>;
}
