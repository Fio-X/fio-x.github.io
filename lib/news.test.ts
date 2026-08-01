import { describe, expect, test } from "bun:test";
import type { ContentCollection } from "./content";
import { projectNewsEntries } from "./news";

describe("News aggregation", () => {
  test("projects published articles, works, and publications into one dated stream", () => {
    const content = {
      articles: [{ slug: "essay", section: "information", template: "essay", title: "Essay", date: "2026-07-20", description: "Essay summary", category: "journal", tags: [], draft: false, body: "" }],
      works: [{ slug: "work", kind: "photography", title: "Work", date: "2026-07-21", summary: "Work summary", tags: [], draft: false, media: [], mediaGroups: [], body: "" }],
      publications: [{ slug: "publication", title: "Publication", date: "2026-07-22", description: "Publication summary", draft: false, body: "" }],
      categories: [], tags: [],
    } satisfies ContentCollection;
    const entries = projectNewsEntries(content);
    expect(entries.map((entry) => entry.id)).toEqual(["publication:publication", "work:work", "information:essay"]);
    expect(entries.map((entry) => entry.href)).toEqual(["/publications/publication/", "/works/work/", "/information/essay/"]);
  });
});
