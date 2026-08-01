import type { Metadata } from "next";
import { LegacyRoute } from "@/components/legacy-route";
import { getContent, staticSlugParams } from "@/lib/content";
import { sitePath } from "@/lib/site-constants";

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() { return staticSlugParams(getContent().articles.map((article) => article.slug)); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const slug = (await params).slug; return { title: "Article moved", robots: { index: false, follow: true }, alternates: { canonical: sitePath(`/information/${slug}`) } }; }
export default async function ArticleLegacyPage({ params }: Props) { return <LegacyRoute target={sitePath(`/information/${(await params).slug}`)} label="前往 Information 文章" />; }
