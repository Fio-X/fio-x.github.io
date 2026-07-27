import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getContent, getWorkBySlug, STATIC_EXPORT_PLACEHOLDER_SLUG, tagHref } from "@/lib/content";
import { workSectionItems } from "@/lib/navigation";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";
export async function generateStaticParams() {
  const slugs = getContent().works.map((work) => work.slug);
  return (slugs.length > 0 ? slugs : [STATIC_EXPORT_PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = getWorkBySlug((await params).slug);
  return work ? { title: work.title, description: work.summary, alternates: { canonical: `/works/${work.slug}` } } : {};
}

export default async function WorkPage({ params }: Props) {
  const work = getWorkBySlug((await params).slug);
  if (!work) notFound();
  return (
    <SiteShell currentPath="/works" layout="work" sectionItems={workSectionItems(`/works/${work.slug}`)}>
      <article className="work-detail">
        <header className="work-detail-header">
          <h1>{work.title}</h1>
          <time dateTime={work.date}>{work.date.slice(0, 4)}</time>
        </header>
        {work.media.length > 0 && <div className="work-media-stream">
          {work.media.map((media) => (
            // Static export serves local public media directly; default next/image optimization needs a server loader.
            // eslint-disable-next-line @next/next/no-img-element
            <img key={media.src} src={media.src} alt={media.alt} className="work-media" />
          ))}
        </div>}
        <section className="work-supplementary" aria-label="作品信息">
          <p>{work.summary}</p>
          {(work.status || work.projectUrl || work.tags.length > 0) && <div className="content-meta">
            {work.status && <span>{work.status}</span>}
            {work.projectUrl && <a href={work.projectUrl}>项目链接</a>}
            {work.tags.map((tag) => <Link key={tag} href={tagHref(tag)}>#{tag}</Link>)}
          </div>}
          {work.body && <ContentBody>{work.body}</ContentBody>}
        </section>
      </article>
    </SiteShell>
  );
}
