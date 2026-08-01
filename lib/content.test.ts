import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Article, MediaGroup, MediaItem, Work } from "./content";
import { renderRss, sitemapPaths } from "./feeds";
import { homeNavItemsFromContent } from "./site";

const originalCwd = process.cwd();
const temporaryDirectories: string[] = [];

function withContent(files: Record<string, string>) {
  const directory = mkdtempSync(join(tmpdir(), "portfolio-blog-content-"));
  temporaryDirectories.push(directory);
  for (const [path, source] of Object.entries(files)) {
    const fullPath = join(directory, path);
    mkdirSync(join(fullPath, ".."), { recursive: true });
    writeFileSync(fullPath, source);
  }
  process.chdir(directory);
  return import(`./content?fixture=${directory}`);
}

afterEach(() => {
  process.chdir(originalCwd);
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

const article = (overrides = "") => `---
title: "First entry"
date: "2026-07-20"
description: "A first entry."
category: "journal"
section: "news"
tags:
  - "writing"
draft: false
${overrides}---

Body`;

const work = (overrides = "") => `---
title: "First work"
date: "2026-07-21"
summary: "A first work."
tags:
  - "web"
draft: false
${overrides}---

Body`;

describe("Markdown content", () => {
  test("sorts published content and derives taxonomy", async () => {
    const { getContent, categoryHref, tagHref } = await withContent({
      "content/articles/older.md": article().replace("2026-07-20", "2026-07-10"),
      "content/articles/newer.md": article().replace("First entry", "Newer entry").replace("2026-07-20", "2026-07-22").replace("- \"writing\"", "- \"writing\"\n  - \"notes\""),
      "content/works/first-work.md": work(),
    });
    const content = getContent();
    expect(content.articles.map((item: Article) => item.slug)).toEqual(["newer", "older"]);
    expect(content.categories).toEqual(["journal"]);
    expect(content.tags).toEqual(["notes", "web", "writing"]);
    expect(categoryHref("reading notes")).toBe("/categories/reading%20notes/");
    expect(tagHref("C++")).toBe("/tags/C%2B%2B/");
  });

  test("excludes drafts from collections, detail params, feeds, and sitemap paths", async () => {
    const { articleHref, getArticleBySlug, getContent, getWorkBySlug, staticSlugParams, workHref } = await withContent({
      "content/articles/public-news.md": article(),
      "content/articles/draft.md": article().replace("draft: false", "draft: true"),
      "content/works/public-work.md": work(),
      "content/works/draft-work.md": work().replace("draft: false", "draft: true"),
    });
    const content = getContent();
    expect(content.articles.map((item: Article) => articleHref(item))).toEqual(["/information/public-news/"]);
    expect(content.works.map((item: Work) => workHref(item.slug))).toEqual(["/works/public-work/"]);
    expect(staticSlugParams(content.articles.map((item: Article) => item.slug))).toEqual([{ slug: "public-news" }]);
    expect(staticSlugParams(content.works.map((item: Work) => item.slug))).toEqual([{ slug: "public-work" }]);
    expect(getArticleBySlug("draft")).toBeUndefined();
    expect(getArticleBySlug("public-news", ["information"])?.slug).toBe("public-news");
    expect(getWorkBySlug("draft-work")).toBeUndefined();
    expect(homeNavItemsFromContent({
      hasNews: true,
      hasWorks: content.works.length > 0,
      hasInformation: true,
    })).toEqual([{ href: "/news/", label: "Latest" }, { href: "/works/", label: "Works" }, { href: "/information/", label: "Information" }]);
    expect(content.categories).toEqual(["journal"]);
    expect(content.tags).toEqual(["web", "writing"]);
    const rss = renderRss({ articles: content.articles, siteName: "Fio", siteDescription: "Test", siteOrigin: "https://example.com" });
    const paths = sitemapPaths(content);
    expect(rss).toContain("/information/public-news/");
    expect(rss).not.toContain("/articles/draft/");
    expect(paths).toContain("/information/public-news/");
    expect(paths).toContain("/works/public-work/");
    expect(paths.join(" ")).not.toContain("draft");
    expect(paths.join(" ")).not.toContain("__static-export-placeholder__");
  });

  test("draft-only content still keeps the fixed home entries", async () => {
    await withContent({
      "content/articles/draft-news.md": article().replace("draft: false", "draft: true"),
      "content/articles/draft-information.md": article().replace('section: "news"', 'section: "information"').replace("draft: false", "draft: true"),
      "content/works/draft-work.md": work().replace("draft: false", "draft: true"),
    });
    expect(homeNavItemsFromContent({ hasNews: false, hasWorks: false, hasInformation: false })).toHaveLength(3);
  });

  test("maps all articles to Information and keeps the template contract", async () => {
    const { getContent, articleHref, getArticlesForSection, workHref } = await withContent({
      "content/articles/news-note.md": article(),
      "content/articles/article-note.md": article().replace('section: "news"', 'section: "articles"').replace("First entry", "Article note"),
      "content/articles/information-note.md": article().replace('section: "news"', 'section: "information"\ntemplate: "conversation"').replace("First entry", "Information note"),
      "content/works/first-work.md": work(),
    });
    const content = getContent();
    expect(content.articles.map((item: Article) => articleHref(item)).sort()).toEqual([
      "/information/article-note/",
      "/information/information-note/",
      "/information/news-note/",
    ]);
    expect(getArticlesForSection("information").find((item: Article) => item.slug === "information-note")?.template).toBe("conversation");
    expect(workHref(content.works[0].slug)).toBe("/works/first-work/");
  });

  test("accepts ordered local work media", async () => {
    const { getContent } = await withContent({
      "public/media/one.jpg": "image", "public/media/two.webp": "image",
      "content/works/gallery.md": work(`media:\n  - src: "/media/one.jpg"\n    alt: "First image"\n  - src: "/media/two.webp"\n    alt: "Second image"\n`),
    });
    expect(getContent().works[0].media.map((media: MediaItem) => media.src)).toEqual(["/media/one.jpg", "/media/two.webp"]);
  });

  test("supports every work kind and cross-content tags", async () => {
    const workOfKind = (kind: string, tag: string) => work(`kind: ${kind}\n`).replace('  - "web"', `  - "${tag}"`);
    const { getContent, getWorksForTag } = await withContent({
      "content/works/photo.md": workOfKind("photography", "photo-only"),
      "content/works/software.md": workOfKind("software", "software-only"),
      "content/works/hardware.md": workOfKind("hardware", "hardware-only"),
      "content/works/mixed.md": workOfKind("mixed", "mixed-only"),
    });
    expect(getContent().works.map((item: Work) => item.kind)).toEqual(["hardware", "mixed", "photography", "software"]);
    expect(getWorksForTag("software-only").map((item: Work) => item.slug)).toEqual(["software"]);
  });

  test("accepts explicit single and pair media groups", async () => {
    const { getContent } = await withContent({
      "public/media/one.jpg": "image", "public/media/two.webp": "image", "public/media/three.png": "image",
      "content/works/grouped.md": work(`media: []\nmediaGroups:\n  - layout: single\n    items:\n      - src: "/media/one.jpg"\n        alt: "One"\n  - layout: pair\n    items:\n      - src: "/media/two.webp"\n        alt: "Two"\n      - src: "/media/three.png"\n        alt: "Three"\n`),
    });
    expect(getContent().works[0].mediaGroups.map((group: MediaGroup) => group.layout)).toEqual(["single", "pair"]);
  });

  test("rejects missing, repeated, or unsafe work media", async () => {
    const { getContent } = await withContent({
      "public/media/one.jpg": "image",
      "content/works/invalid.md": work(`media:\n  - src: "/media/one.jpg"\n    alt: "One"\n  - src: "/media/one.jpg"\n    alt: "Again"\n`),
    });
    expect(() => getContent()).toThrow("media paths must not contain duplicates");
  });

  test("rejects invalid metadata and non-local Markdown images", async () => {
    const { getContent, ContentValidationError } = await withContent({
      "content/articles/invalid.md": article("unknown: true\n").replace('date: "2026-07-20"', 'date: "not-a-date"').replace("Body", "![remote](https://example.com/a.jpg)"),
    });
    expect(() => getContent()).toThrow(ContentValidationError);
    expect(() => getContent()).toThrow("invalid.md");
  });

  test("rejects duplicate tags and invalid authoring filenames", async () => {
    const { getContent } = await withContent({
      "content/articles/Bad Slug.md": article().replace("- \"writing\"", "- \"writing\"\n  - \"writing\""),
    });
    expect(() => getContent()).toThrow("lowercase kebab-case slug");
  });
});
