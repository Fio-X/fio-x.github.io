import Link from "next/link";
import { MediaImage } from "@/components/media-image";
import { EntryDates } from "@/components/entry-dates";
import type { NewsEntry } from "@/lib/news";

export function NewsList({ entries }: { entries: readonly NewsEntry[] }) {
  return <ol className="contents news-contents news-list">
    {entries.map((entry) => <li className="news-item cf" key={entry.id}>
      {entry.cover && <div className="news-img"><span className="news-img-inner"><Link href={entry.href}>
        <MediaImage className="prototype-image post-img news-image" src={entry.cover} alt={entry.coverAlt ?? ""} />
      </Link></span></div>}
      <div className="news-text"><p className="category">{entry.category}</p><p><Link href={entry.href}>{entry.title}</Link></p>{entry.dateLabel ? <p>{entry.dateLabel}</p> : <EntryDates published={entry.published} updated={entry.updated} fallback={entry.date} />}{entry.place && <p>{entry.placeUrl ? <a href={entry.placeUrl} target="_blank" rel="noreferrer">{entry.place}</a> : entry.place}</p>}</div>
      <hr className="section-line" />
    </li>)}
  </ol>;
}
