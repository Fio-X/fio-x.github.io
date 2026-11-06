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

describe("News dates", () => {
  test("keeps published and updated dates while sorting by the latest change", () => {
    const content = {
      articles: [
        { slug: "revised", section: "information", template: "essay", title: "Revised", date: "2026-07-01", updated: "2026-08-03", description: "d", category: "journal", tags: [], draft: false, body: "" },
        { slug: "fresh", section: "information", template: "essay", title: "Fresh", date: "2026-07-20", description: "d", category: "journal", tags: [], draft: false, body: "" },
      ],
      works: [], publications: [], categories: [], tags: [],
    } satisfies ContentCollection;
    const entries = projectNewsEntries(content);
    expect(entries.map((entry) => entry.id)).toEqual(["information:revised", "information:fresh"]);
    expect(entries[0]).toMatchObject({ date: "2026-08-03", published: "2026-07-01", updated: "2026-08-03" });
    expect(entries[1]).toMatchObject({ date: "2026-07-20", published: "2026-07-20" });
    expect(entries[1].updated).toBeUndefined();
  });
});
