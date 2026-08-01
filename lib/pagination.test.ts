import { describe, expect, test } from "bun:test";
import { NEWS_PAGE_SIZE, pageCount, paginatedPathForParam, pagePath, paginationParams, PUBLICATIONS_PAGE_SIZE } from "./pagination";
import { sitePath } from "./site-constants";

describe("pagination", () => {
  test("uses prototype page sizes and omits page one from URLs", () => {
    expect(NEWS_PAGE_SIZE).toBe(3);
    expect(PUBLICATIONS_PAGE_SIZE).toBe(6);
    expect(pageCount(0, NEWS_PAGE_SIZE)).toBe(1);
    expect(pageCount(4, NEWS_PAGE_SIZE)).toBe(2);
    expect(pagePath("/news", 1)).toBe("/news/");
    expect(pagePath("/news", 2)).toBe("/news/page/2/");
    expect(paginationParams(7, NEWS_PAGE_SIZE)).toEqual([{ page: "2" }, { page: "3" }]);
    expect(paginationParams(0, NEWS_PAGE_SIZE)).toEqual([{ page: "__static-export-placeholder__" }]);
    expect(paginatedPathForParam("/news", "2")).toBe("/news/page/2/");
    expect(paginatedPathForParam("/news", "__static-export-placeholder__")).toBeUndefined();
    expect(paginatedPathForParam("/news", "1")).toBeUndefined();
    expect(sitePath("/news?draft=false#latest")).toBe("/news/?draft=false#latest");
  });
});
