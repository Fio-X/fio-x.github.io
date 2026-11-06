/** Calendar date (YYYY-MM-DD) in the author's local time zone, not UTC. */
export function localIsoDate(date: Date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
