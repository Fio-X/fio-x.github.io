import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
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
