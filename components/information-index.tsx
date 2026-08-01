import Link from "next/link";
import type { Article } from "@/lib/content";
import { articleHref } from "@/lib/content";
import { sitePath } from "@/lib/site-constants";

const TEMPLATE_LABELS = { essay: "Essay", "image-notes": "Image Notes", conversation: "Conversation" } as const;

export function InformationIndex({ articles }: { articles: readonly Article[] }) {
  return <div className="contents information-contents"><section id="information" className="information-index">
    <h1 className="title">Information</h1>
    <p className="index-intro">Articles, image notes and conversations.</p>
    <nav className="information-template-links" aria-label="Information templates">{Object.entries(TEMPLATE_LABELS).map(([template, label]) => <Link key={template} href={sitePath(`/information/type/${template}`)}>{label}</Link>)}</nav>
    {articles.length === 0 ? <p className="empty-state">Information 将在这里发布。</p> : <div className="information-entry-list">{articles.map((article) => <article className="information-entry" key={article.slug}>
      <p className="entry-type">{article.category} · {article.date}</p>
      <h2><Link href={articleHref(article)}>{article.title}</Link></h2>
      <p className="entry-template">Template: {TEMPLATE_LABELS[article.template]}</p>
      <p className="entry-summary">{article.description}</p>
      <Link className="entry-link" href={articleHref(article)}>Open entry →</Link>
    </article>)}</div>}
  </section></div>;
}
