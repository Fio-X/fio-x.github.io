import { describe, expect, test } from "bun:test";
import { STATIC_EXPORT_PLACEHOLDER_SLUG, staticSlugParams } from "@/lib/content";
import { paginationParams, NEWS_PAGE_SIZE, PUBLICATIONS_PAGE_SIZE } from "@/lib/pagination";
import { homeNavItemsFromContent } from "@/lib/site";

describe("static route contracts", () => {
  test("home keeps the frozen public destinations even with empty content", () => {
    expect(homeNavItemsFromContent({ hasNews: false, hasWorks: false, hasInformation: false })).toEqual([
      { href: "/news/", label: "Latest" },
      { href: "/works/", label: "Works" },
      { href: "/information/", label: "Information" },
    ]);
  });

  test("static detail params use public slugs and a build-only empty placeholder", () => {
    expect(staticSlugParams(["published-entry"])).toEqual([{ slug: "published-entry" }]);
    expect(staticSlugParams([])).toEqual([{ slug: STATIC_EXPORT_PLACEHOLDER_SLUG }]);
  });

  test("pagination route params use real page numbers and a build-only empty placeholder", () => {
    expect(paginationParams(4, NEWS_PAGE_SIZE)).toEqual([{ page: "2" }]);
    expect(paginationParams(7, PUBLICATIONS_PAGE_SIZE)).toEqual([{ page: "2" }]);
    expect(paginationParams(0, NEWS_PAGE_SIZE)).toEqual([{ page: "__static-export-placeholder__" }]);
  });
});
