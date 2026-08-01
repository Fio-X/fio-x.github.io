import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentBody } from "@/components/content-body";
import { SiteShell } from "@/components/site-shell";
import { getContent, staticSlugParams } from "@/lib/content";
import { sitePath } from "@/lib/site-constants";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() { return staticSlugParams(getContent().publications.map((publication) => publication.slug)); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const publication = getContent().publications.find((item) => item.slug === slug);
  return publication ? { title: publication.title, description: publication.description, alternates: { canonical: sitePath(`/publications/${publication.slug}`) } } : {};
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const publication = getContent().publications.find((item) => item.slug === slug);
  if (!publication) notFound();
  return <SiteShell currentPath={sitePath("/publications")}><article className="publication-detail"><header className="article-head"><p className="article-kicker">Publication</p><h1 className="title">{publication.title}</h1><p className="article-date">{publication.date}</p></header>{publication.cover && <figure className="template-media">
    {/* Static export serves public media directly. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={publication.cover} alt={publication.coverAlt ?? `${publication.title} cover`} />
  </figure>} {publication.description && <p className="article-lead">{publication.description}</p>} {(publication.publisher || publication.authors?.length) && <div className="publication-meta">{publication.publisher && <p>{publication.publisher}</p>}{publication.authors?.map((author) => <p key={author}>{author}</p>)}</div>} {publication.body && <div className="article-body"><ContentBody>{publication.body}</ContentBody></div>}<a className="information-back" href={sitePath("/publications")}>← Publications</a></article></SiteShell>;
}
