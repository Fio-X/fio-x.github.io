import Link from "next/link";
import type { NewsEntry } from "@/lib/news";
import { sitePath } from "@/lib/site-constants";

export function NewsList({ entries }: { entries: readonly NewsEntry[] }) {
  return <ol className="contents news-contents news-list">
    {entries.map((entry) => <li className="news-item cf" key={entry.id}>
      {entry.cover && <div className="news-img"><span className="news-img-inner"><Link href={entry.href}>
        {/* Static export serves public media directly. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="prototype-image post-img news-image" src={entry.cover} alt={entry.coverAlt ?? ""} />
      </Link></span></div>}
      <div className="news-text"><p className="category">{entry.category}</p><p><Link href={entry.href}>{entry.title}</Link></p><p>{entry.dateLabel ?? entry.date}</p>{entry.place && <p>{entry.placeUrl ? <a href={entry.placeUrl} target="_blank" rel="noreferrer">{entry.place}</a> : entry.place}</p>}</div>
      <hr className="section-line" />
    </li>)}
  </ol>;
}

export function newsPath(page = 1) { return sitePath(page === 1 ? "/news" : `/news/page/${page}`); }
