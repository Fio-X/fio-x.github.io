import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("blog CLI", () => {
  test("documents publication creation and work kinds", () => {
    const source = readFileSync(join(process.cwd(), "scripts/blog.ts"), "utf8");
    expect(source).toContain('new publication <slug>');
    expect(source).toContain('kind photography|software|hardware|mixed');
    expect(source).toContain('new article <slug> [--template essay|image-notes|conversation]');
    expect(source).toContain('template essay|image-notes|conversation');
  });

  test("supports a temporary publication target directory contract", () => {
    const directory = mkdtempSync(join(tmpdir(), "portfolio-blog-cli-"));
    try {
      expect(existsSync(join(directory))).toBe(true);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

describe("blog CLI argument and content checks", () => {
  const script = join(process.cwd(), "scripts/blog.ts");
  const templates = join(process.cwd(), "content/templates");

  function inTemporarySite(run: (directory: string, blog: (...args: string[]) => { code: number; stderr: string }) => void) {
    const directory = mkdtempSync(join(tmpdir(), "portfolio-blog-cli-"));
    try {
      cpSync(templates, join(directory, "content/templates"), { recursive: true });
      const blog = (...args: string[]) => {
        const result = Bun.spawnSync(["bun", script, ...args], { cwd: directory, stderr: "pipe", stdout: "pipe" });
        return { code: result.exitCode, stderr: result.stderr.toString() };
      };
      run(directory, blog);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }

  test("reports unknown flags as unknown and missing values only for value options", () => {
    inTemporarySite((directory, blog) => {
      expect(blog("validate", "--fast").stderr).toContain("validate does not accept --fast");
      const missing = blog("new", "article", "no-title", "--title");
      expect(missing.code).toBe(1);
      expect(missing.stderr).toContain("--title requires a value");
      expect(existsSync(join(directory, "content/articles/no-title.md"))).toBe(false);
    });
  });

  test("rejects unknown options before writing anything", () => {
    inTemporarySite((directory, blog) => {
      const result = blog("new", "article", "typo", "--titel", "Oops");
      expect(result.code).toBe(1);
      expect(result.stderr).toContain("does not accept --titel");
      expect(existsSync(join(directory, "content/articles/typo.md"))).toBe(false);
    });
  });

  test("rejects an invalid work kind before writing anything", () => {
    inTemporarySite((directory, blog) => {
      const result = blog("new", "work", "bad-kind", "--kind", "video");
      expect(result.code).toBe(1);
      expect(result.stderr).toContain("--kind must be");
      expect(existsSync(join(directory, "content/works/bad-kind.md"))).toBe(false);
    });
  });

  test("removes a created file that fails validation", () => {
    inTemporarySite((directory, blog) => {
      const result = blog("new", "article", "bad-date", "--date", "not-a-date");
      expect(result.code).toBe(1);
      expect(result.stderr).toContain("nothing was written");
      expect(existsSync(join(directory, "content/articles/bad-date.md"))).toBe(false);
    });
  });

  test("creates valid files and readable page titles", () => {
    inTemporarySite((directory, blog) => {
      expect(blog("new", "article", "good-entry", "--title", "Good", "--tags", "a,b").code).toBe(0);
      expect(readFileSync(join(directory, "content/articles/good-entry.md"), "utf8")).toContain('title: "Good"');
      expect(blog("new", "page", "biography").code).toBe(0);
      expect(readFileSync(join(directory, "content/pages/biography.md"), "utf8")).toContain('title: "Biography"');
    });
  });
});
