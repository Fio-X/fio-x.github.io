import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { NewsEntry } from "@/lib/news";
import { NewsList } from "./news-list";

const entry = (overrides: Partial<NewsEntry>): NewsEntry => ({ id: "information:x", source: "article", category: "News", title: "X", date: "2026-07-20", href: "/information/x/", ...overrides });

describe("NewsList dates", () => {
  test("shows only the published date when there is no update", () => {
    const html = renderToStaticMarkup(<NewsList entries={[entry({ published: "2026-07-20" })]} />);
    expect(html).toContain('<time dateTime="2026-07-20">2026-07-20</time>');
    expect(html).not.toContain("更新");
  });

  test("shows both published and updated dates when the entry was updated", () => {
    const html = renderToStaticMarkup(<NewsList entries={[entry({ date: "2026-08-03", published: "2026-07-01", updated: "2026-08-03" })]} />);
    expect(html).toContain('<time dateTime="2026-07-01">发布 2026-07-01</time> · <time dateTime="2026-08-03">更新 2026-08-03</time>');
  });

  test("shows only the updated date for pages without a published date", () => {
    const html = renderToStaticMarkup(<NewsList entries={[entry({ source: "page", date: "2026-08-03", updated: "2026-08-03" })]} />);
    expect(html).toContain("更新 2026-08-03");
    expect(html).not.toContain("发布");
  });
});

describe("Article page dates", () => {
  test("shows the same published and updated dates as the News list", async () => {
    const { InformationArticle } = await import("./information-article");
    const article = { slug: "x", template: "essay", title: "X", date: "2026-07-01", updated: "2026-08-03", description: "d", category: "journal", tags: [], draft: false, body: "" } as const;
    const html = renderToStaticMarkup(<InformationArticle article={{ ...article, tags: [] }} />);
    expect(html).toContain('<p class="article-date"><time dateTime="2026-07-01">发布 2026-07-01</time> · <time dateTime="2026-08-03">更新 2026-08-03</time></p>');
  });
});
