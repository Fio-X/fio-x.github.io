import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GET } from "./sitemap.xml/route";

const originalCwd = process.cwd();
const temporaryDirectories: string[] = [];

function withPages(pages: Record<string, string>) {
  const directory = mkdtempSync(join(tmpdir(), "portfolio-blog-sitemap-"));
  temporaryDirectories.push(directory);
  mkdirSync(join(directory, "content/pages"), { recursive: true });
  for (const [slug, source] of Object.entries(pages)) writeFileSync(join(directory, "content/pages", `${slug}.md`), source);
  process.chdir(directory);
}

afterEach(() => {
  process.chdir(originalCwd);
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

const page = (title: string, extra = "") => `---\ntitle: "${title}"\n${extra}---\n\nPublic text.\n`;

describe("sitemap route", () => {
  test("omits fixed pages that are missing or still drafts", async () => {
    withPages({ contact: page("Contact", "draft: true\n") });
    const xml = await (await GET()).text();
    expect(xml).toContain("https://fio-x.github.io/news/");
    expect(xml).not.toContain("/biography/");
    expect(xml).not.toContain("/contact/");
  });

  test("includes fixed pages that have public content", async () => {
    withPages({ biography: page("Biography"), contact: page("Contact") });
    const xml = await (await GET()).text();
    expect(xml).toContain("https://fio-x.github.io/biography/");
    expect(xml).toContain("https://fio-x.github.io/contact/");
  });
});
