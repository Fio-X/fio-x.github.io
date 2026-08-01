import { sitePath } from "@/lib/site-constants";

export const NEWS_PAGE_SIZE = 3;
export const PUBLICATIONS_PAGE_SIZE = 6;
export const STATIC_EXPORT_PLACEHOLDER_PAGE = "__static-export-placeholder__";

export function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function pagePath(basePath: string, page: number) {
  return sitePath(page === 1 ? basePath : `${basePath}/page/${page}`);
}

export function paginationParams(total: number, pageSize: number) {
  const params = Array.from({ length: Math.max(0, pageCount(total, pageSize) - 1) }, (_, index) => ({ page: String(index + 2) }));
  return params.length > 0 ? params : [{ page: STATIC_EXPORT_PLACEHOLDER_PAGE }];
}

export function paginatedPathForParam(basePath: string, pageParam: string) {
  if (pageParam === STATIC_EXPORT_PLACEHOLDER_PAGE) return undefined;
  const page = Number(pageParam);
  return Number.isInteger(page) && page >= 2 ? pagePath(basePath, page) : undefined;
}
