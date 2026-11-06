import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentBody } from "./content-body";

const render = (markdown: string, sectionIds?: Record<string, string>) => renderToStaticMarkup(<ContentBody sectionIds={sectionIds}>{markdown}</ContentBody>);

describe("ContentBody GFM", () => {
  test("renders tables, double-tilde strikethrough, autolinks and task lists", () => {
    const html = render("| a | b |\n|---|---|\n| 1 | 2 |\n\n~~旧~~ https://example.com\n\n- [x] 完成");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
    expect(html).toContain("<del>旧</del>");
    expect(html).toContain('<a href="https://example.com">https://example.com</a>');
    expect(html).toContain('class="task-list-item"');
  });

  test("keeps Chinese ranges with single tildes as plain text", () => {
    const html = render("行程 3~5天和7~9天");
    expect(html).toContain("3~5天和7~9天");
    expect(html).not.toContain("<del>");
  });

  test("labels footnotes in Chinese and keeps the hidden label heading", () => {
    const html = render("正文[^1]\n\n[^1]: 说明");
    expect(html).toContain('<h2 class="sr-only" id="footnote-label">脚注</h2>');
    expect(html).toContain('aria-label="返回引用 1"');
  });

  test("still anchors declared sections and still skips raw HTML", () => {
    const html = render("## Profile\n\n<script>alert(1)</script>", { Profile: "profile" });
    expect(html).toContain('<h2 id="profile">Profile</h2>');
    expect(html).not.toContain("<script>");
  });
});
