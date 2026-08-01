export const SITE_NAME = "Fio";
export const SITE_DESCRIPTION = "作品、写作与学习记录。";
export const SITE_ORIGIN = "https://fio-x.github.io";

export function sitePath(path: string) {
  const match = path.match(/^([^?#]*)([?#].*)?$/);
  const pathname = match?.[1] ?? path;
  const suffix = match?.[2] ?? "";
  const lastSegment = pathname.slice(pathname.lastIndexOf("/") + 1);
  const staticFile = /\.(?:html?|css|js|json|xml|txt|ico|svg|pdf)$/i.test(lastSegment);
  if (pathname === "/" || pathname.endsWith("/") || staticFile) return `${pathname}${suffix}`;
  return `${pathname}/${suffix}`;
}
