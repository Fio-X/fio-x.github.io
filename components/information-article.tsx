import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import { ContentBody } from "@/components/content-body";
import { EntryDates } from "@/components/entry-dates";
import { categoryHref, tagHref, type Article } from "@/lib/content";
import { sitePath } from "@/lib/site-constants";

export function InformationArticle({ article }: { article: Article }) {
  const detailClass = article.template === "image-notes" ? "image-notes" : article.template === "conversation" ? "narrow conversation" : "narrow essay";
  return <article className={`information-article ${detailClass}`}>
    <header className="article-head"><p className="article-kicker">{article.category} · Information</p><h1 className="title">{article.title}</h1><EntryDates className="article-date" published={article.date} updated={article.updated} /><p className="article-lead">{article.description}</p></header>
    {article.cover && <figure className="template-media"><div className="template-image hero">
      <MediaImage src={article.cover} alt="" />
    </div></figure>}
    <div className="article-body"><ContentBody variant={article.template}>{article.body}</ContentBody></div>
    <nav className="taxonomy" aria-label="文章分类和标签"><Link href={categoryHref(article.category)}>{article.category}</Link>{article.tags.map((tag) => <Link key={tag} href={tagHref(tag)}>#{tag}</Link>)}</nav>
    <Link className="information-back" href={sitePath("/information")}>← Information</Link>
  </article>;
}
