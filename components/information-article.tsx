import Link from "next/link";
import { ContentBody } from "@/components/content-body";
import { categoryHref, tagHref, type Article } from "@/lib/content";
import { sitePath } from "@/lib/site-constants";

export function InformationArticle({ article }: { article: Article }) {
  const detailClass = article.template === "image-notes" ? "image-notes" : article.template === "conversation" ? "narrow conversation" : "narrow essay";
  return <article className={`information-article ${detailClass}`}>
    <header className="article-head"><p className="article-kicker">{article.category} · Information</p><h1 className="title">{article.title}</h1><p className="article-date"><time dateTime={article.updated ?? article.date}>{article.updated ?? article.date}</time></p><p className="article-lead">{article.description}</p></header>
    {article.cover && <figure className="template-media"><div className="template-image hero">
      {/* Static export serves public media directly. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={article.cover} alt="" />
    </div></figure>}
    <div className="article-body"><ContentBody variant={article.template}>{article.body}</ContentBody></div>
    <nav className="taxonomy" aria-label="文章分类和标签"><Link href={categoryHref(article.category)}>{article.category}</Link>{article.tags.map((tag) => <Link key={tag} href={tagHref(tag)}>#{tag}</Link>)}</nav>
    <Link className="information-back" href={sitePath("/information")}>← Information</Link>
  </article>;
}
