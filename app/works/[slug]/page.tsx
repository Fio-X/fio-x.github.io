import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getContent, getWorkBySlug, staticSlugParams, tagHref, workHref } from "@/lib/content";
import { workSectionItems } from "@/lib/navigation";
import { sitePath } from "@/lib/site-constants";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";
export async function generateStaticParams() {
  const slugs = getContent().works.map((work) => work.slug);
  return staticSlugParams(slugs);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = getWorkBySlug((await params).slug);
  return work ? { title: work.title, description: work.summary, alternates: { canonical: workHref(work.slug) } } : {};
}

export default async function WorkPage({ params }: Props) {
  const work = getWorkBySlug((await params).slug);
  if (!work) notFound();
  const groups = work.mediaGroups.length > 0 ? work.mediaGroups : work.media.map((item) => ({ layout: "single" as const, items: [item] }));
  return <SiteShell currentPath={sitePath("/works")} layout="work" sectionItems={workSectionItems(`/works/${work.slug}`)}><article className="detail">
    <h1 className="detail-head">{work.title}<span className="meta">{work.date.slice(0, 4)} · {work.kind}</span></h1>
    <div className="stream">{groups.map((group, groupIndex) => group.layout === "pair" ? <div className="media-group media-group-pair" key={groupIndex}>{group.items.map((media) => <figure key={media.src}><img className="work-media" src={media.src} alt={media.alt} /><figcaption className="caption">{media.alt}</figcaption></figure>)}</div> : <figure className="media-group" key={groupIndex}><img className={`work-media${groupIndex === groups.length - 1 && groups.length > 2 ? " tall" : ""}`} src={group.items[0].src} alt={group.items[0].alt} /><figcaption className="caption">{group.items[0].alt}</figcaption></figure>)}</div>
    <div className="work-supplementary"><p>{work.summary}</p>{work.role && <p>{work.role}</p>}{(work.status || work.projectUrl || work.tags.length > 0) && <div className="taxonomy">{work.status && <span>{work.status}</span>}{work.projectUrl && <a href={work.projectUrl}>项目链接</a>}{work.tags.map((tag) => <Link key={tag} href={tagHref(tag)}>#{tag}</Link>)}</div>}{work.body && <ContentBody>{work.body}</ContentBody>}</div>
  </article></SiteShell>;
}
