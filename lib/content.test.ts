import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Article, MediaItem } from "./content";

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
    expect(categoryHref("reading notes")).toBe("/categories/reading%20notes");
    expect(tagHref("C++")).toBe("/tags/C%2B%2B");
  });

  test("excludes drafts from all public collections", async () => {
    const { getContent } = await withContent({
      "content/articles/draft.md": article().replace("draft: false", "draft: true"),
      "content/works/draft-work.md": work().replace("draft: false", "draft: true"),
    });
    expect(getContent()).toEqual({ articles: [], works: [], categories: [], tags: [] });
  });

  test("accepts ordered local work media", async () => {
    const { getContent } = await withContent({
      "public/media/one.jpg": "image", "public/media/two.webp": "image",
      "content/works/gallery.md": work(`media:\n  - src: "/media/one.jpg"\n    alt: "First image"\n  - src: "/media/two.webp"\n    alt: "Second image"\n`),
    });
    expect(getContent().works[0].media.map((media: MediaItem) => media.src)).toEqual(["/media/one.jpg", "/media/two.webp"]);
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
