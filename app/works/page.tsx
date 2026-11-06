import type { Metadata } from "next";
import { MediaImage } from "@/components/media-image";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { getContent, workHref } from "@/lib/content";
import { workSectionItems } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

export const metadata: Metadata = { title: "Works", alternates: { canonical: sitePath("/works") } };

export default function WorksPage() {
  const { works } = getContent();
  return <SiteShell currentPath={sitePath("/works")} layout="work" sectionItems={workSectionItems("/works")}><h1 className="page-title">Works</h1>
    {works.length === 0 ? <p className="empty-state">作品将在这里发布。</p> : <ol className="works">{works.map((work) => <li className="work" id={`work-${work.slug}`} key={work.slug}>
      {/* Same destination as the title link below: kept out of the tab order and the accessibility tree. */}
      <Link href={workHref(work.slug)} tabIndex={-1} aria-hidden="true">{work.cover ? <MediaImage className="work-cover" src={work.cover} /> : <span className="work-cover work-placeholder" aria-hidden="true" />}</Link>
      <h2><Link href={workHref(work.slug)}>{work.title}</Link></h2><p>{work.date.slice(0, 4)} · <span className="work-kind">{work.kind}</span>{work.role ? ` / ${work.role}` : ""}</p>
    </li>)}</ol>}
  </SiteShell>;
}
