import { describe, expect, test } from "bun:test";
import { renderRss, renderSitemap, sitemapPaths } from "./feeds";
import type { Article, ContentCollection } from "./content";

const article: Article = {
  slug: "one-entry", section: "information", template: "essay", title: "One & Entry", date: "2026-07-20", description: "<summary>", category: "News", tags: [], draft: false, body: "",
};

describe("feeds", () => {
  test("escapes RSS data and emits article links", () => {
    const xml = renderRss({ articles: [article], siteName: "Fio & Co", siteDescription: "A <site>", siteOrigin: "https://fio-x.github.io" });
    expect(xml).toContain("One &amp; Entry");
    expect(xml).toContain("https://fio-x.github.io/information/one-entry/");
    expect(xml).toContain("A &lt;site&gt;");
  });

  test("deduplicates and escapes sitemap paths", () => {
    const xml = renderSitemap(["/", "/tags/C%2B%2B", "/tags/C%2B%2B", "/articles/__static-export-placeholder__/"], "https://fio-x.github.io");
    expect(xml.match(/<url>/g)?.length).toBe(2);
    expect(xml).toContain("https://fio-x.github.io/tags/C%2B%2B/");
    expect(xml).not.toContain("__static-export-placeholder__");
  });

  test("derives sitemap taxonomy from the published collection", () => {
    const content = {
      articles: [article],
      works: [],
      publications: [],
      categories: [],
      tags: [],
    } satisfies ContentCollection;
    expect(renderSitemap(sitemapPaths(content), "https://fio-x.github.io")).toContain("https://fio-x.github.io/news/");
  });
});
