/**
 * Published date, plus the updated date when it differs. Shared by the News list and
 * article pages so readers see the same dates in both places.
 */
export function EntryDates({ published, updated, fallback, className }: { published?: string; updated?: string; fallback?: string; className?: string }) {
  const changed = updated && updated !== published ? updated : undefined;
  if (!changed) {
    const date = published ?? fallback;
    return date ? <p className={className}><time dateTime={date}>{date}</time></p> : null;
  }
  return <p className={className}>{published && <><time dateTime={published}>发布 {published}</time>{" · "}</>}<time dateTime={changed}>更新 {changed}</time></p>;
}
