import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { ARTICLE_TEMPLATES, getPage, getReferencedMedia, type PageSlug, validateContent, validateContentFile, WORK_KINDS } from "../lib/content";
import { localIsoDate } from "../lib/dates";

const ROOT = process.cwd();
const CONTENT = resolve(ROOT, "content");
const TEMPLATES = resolve(CONTENT, "templates");
const MEDIA = resolve(ROOT, "public/media");
const PAGE_TITLES: Record<PageSlug, string> = { information: "Information", biography: "Biography", contact: "Contact" };
const BOOLEAN_OPTIONS: readonly string[] = ["force", "unused"];
/** Options each command accepts; anything else is rejected instead of silently ignored. */
const ALLOWED_OPTIONS = {
  article: ["title", "date", "description", "category", "tags", "template", "section"],
  work: ["title", "date", "summary", "kind", "tags"],
  publication: ["title", "date", "description", "publisher"],
  page: ["date", "force"],
  "media add": ["name"],
  "media list": ["unused"],
  validate: [],
  build: [],
} as const;
const CONTENT_KINDS = ["article", "work", "publication"] as const;
type ContentKind = (typeof CONTENT_KINDS)[number];
const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function fail(message: string): never {
  console.error(`blog: ${message}`);
  process.exit(1);
}

function assertSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail("slug must be lowercase kebab-case");
}

function inside(root: string, path: string) {
  return path.startsWith(`${root}/`);
}

function parseOptions(args: string[]) {
  const options = new Map<string, string | boolean>();
  const positional: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (BOOLEAN_OPTIONS.includes(key)) {
      options.set(key, true);
      continue;
    }
    const value = args[index + 1];
    // Record a missing value as `true`; assertAllowedOptions reports unknown flags first, then missing values.
    if (!value || value.startsWith("--")) {
      options.set(key, true);
      continue;
    }
    options.set(key, value);
    index += 1;
  }
  return { options, positional };
}

function assertAllowedOptions(options: Map<string, string | boolean>, context: keyof typeof ALLOWED_OPTIONS) {
  const allowed: readonly string[] = ALLOWED_OPTIONS[context];
  const unknown = [...options.keys()].filter((key) => !allowed.includes(key));
  if (unknown.length) fail(`${context} does not accept ${unknown.map((key) => `--${key}`).join(", ")}${allowed.length ? ` (allowed: ${allowed.map((key) => `--${key}`).join(", ")})` : ""}`);
  const missingValue = [...options].find(([key, value]) => value === true && !BOOLEAN_OPTIONS.includes(key));
  if (missingValue) fail(`--${missingValue[0]} requires a value`);
}

/** Writes a new file, validates it, and restores the previous state if validation fails. */
function writeValidated(target: string, source: string, validate: () => void) {
  const previous = existsSync(target) ? readFileSync(target, "utf8") : undefined;
  writeFileSync(target, source);
  try {
    validate();
  } catch (error) {
    if (previous === undefined) rmSync(target);
    else writeFileSync(target, previous);
    fail(`${error instanceof Error ? error.message : String(error)} (nothing was written)`);
  }
}

function option(options: Map<string, string | boolean>, key: string) {
  const value = options.get(key);
  return typeof value === "string" ? value : undefined;
}

function replaceTemplate(template: string, fields: Record<string, string | undefined>) {
  return Object.entries(fields).reduce((result, [key, value]) => value === undefined ? result : result.replace(new RegExp(`^${key}:.*$`, "m"), `${key}: ${JSON.stringify(value)}`), template);
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function usage() {
  console.log(`Usage:
  bun run blog -- new article <slug> [--template essay|image-notes|conversation] [--title TITLE --date YYYY-MM-DD --description TEXT --category NAME --tags a,b]
  bun run blog -- new work <slug> [--title TITLE --date YYYY-MM-DD --summary TEXT --kind photography|software|hardware|mixed --tags a,b]
  bun run blog -- new publication <slug> [--title TITLE --date YYYY-MM-DD --description TEXT --publisher NAME]
  bun run blog -- new page <information|biography|contact> [--force]
  bun run blog -- validate
  bun run blog -- media add <source> --name <filename>
  bun run blog -- media list [--unused]
  bun run blog -- build`);
}

function create(kind: ContentKind, slug: string, options: Map<string, string | boolean>) {
  assertSlug(slug);
  const targetDirectory = resolve(CONTENT, `${kind}s`);
  const target = resolve(targetDirectory, `${slug}.md`);
  if (!inside(targetDirectory, target)) fail("target is outside the content directory");
  if (existsSync(target)) fail(`${target} already exists`);

  const template = readFileSync(join(TEMPLATES, `${kind}.md`), "utf8");
  const date = option(options, "date") ?? localIsoDate();
  const legacySection = option(options, "section");
  if (kind === "article" && legacySection) fail("new article no longer accepts --section; articles belong to Information");
  const articleTemplate = option(options, "template") ?? "essay";
  if (kind === "article" && !ARTICLE_TEMPLATES.includes(articleTemplate as (typeof ARTICLE_TEMPLATES)[number])) fail("--template must be essay, image-notes, or conversation");
  const workKind = option(options, "kind");
  if (kind === "work" && workKind !== undefined && !WORK_KINDS.includes(workKind as (typeof WORK_KINDS)[number])) fail(`--kind must be ${WORK_KINDS.join(", ")}`);
  const fields = kind === "article"
    ? { title: option(options, "title"), date, description: option(options, "description"), category: option(options, "category"), template: articleTemplate }
    : kind === "work"
      ? { title: option(options, "title"), date, summary: option(options, "summary"), kind: workKind }
      : { title: option(options, "title"), date, description: option(options, "description"), publisher: option(options, "publisher") };
  const withFields = replaceTemplate(template, fields);
  const tags = option(options, "tags");
  const source = tags ? withFields.replace(/tags:\n(?:  - .*\n)+/, `tags:\n${tags.split(",").map((tag) => `  - ${JSON.stringify(tag.trim())}`).join("\n")}\n`) : withFields;
  mkdirSync(targetDirectory, { recursive: true });
  writeValidated(target, source, () => validateContentFile(kind, target));
  console.log(`Created ${target}`);
}

function createPage(slug: string, force: boolean) {
  if (!Object.hasOwn(PAGE_TITLES, slug)) fail("new page accepts information, biography, or contact");
  const pageSlug = slug as PageSlug;
  const target = resolve(CONTENT, `pages/${pageSlug}.md`);
  if (existsSync(target) && !force) fail(`${target} already exists; use --force to replace it`);
  mkdirSync(join(CONTENT, "pages"), { recursive: true });
  const date = option(options, "date") ?? localIsoDate();
  const source = replaceTemplate(readFileSync(join(TEMPLATES, "page.md"), "utf8"), { title: PAGE_TITLES[pageSlug], date, updated: date });
  writeValidated(target, source, () => getPage(pageSlug));
  console.log(`Created ${target}`);
}

function addMedia(sourceArgument: string, name: string) {
  const source = resolve(ROOT, sourceArgument);
  if (!existsSync(source) || !statSync(source).isFile()) fail("source must be an existing file inside this repository");
  if (!inside(ROOT, source)) fail("source must be inside this repository");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(avif|gif|jpeg|jpg|png|webp)$/i.test(name)) fail("--name must be lowercase kebab-case with an allowed image extension");
  if (!IMAGE_EXTENSIONS.has(extname(name).toLowerCase()) || !IMAGE_EXTENSIONS.has(extname(source).toLowerCase())) fail("source and target must use allowed image extensions");
  const target = resolve(MEDIA, name);
  if (!inside(MEDIA, target)) fail("target is outside public/media");
  if (existsSync(target)) fail(`${target} already exists`);
  mkdirSync(MEDIA, { recursive: true });
  cpSync(source, target, { errorOnExist: true });
  console.log(`Added /media/${name}`);
}

function listMedia(unused: boolean) {
  if (!existsSync(MEDIA)) return;
  const references = getReferencedMedia();
  for (const file of readdirSync(MEDIA).filter((name) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase())).sort()) {
    const path = `/media/${file}`;
    if (!unused || !references.has(path)) console.log(`${references.has(path) ? "used" : "unused"}\t${path}`);
  }
}

const [command, ...args] = process.argv.slice(2);
if (!command || command === "help" || command === "--help") {
  usage();
  process.exit(0);
}

const { options, positional } = parseOptions(args);
try {
  if (command === "new") {
    const [kind, slug] = positional;
    if (kind && (CONTENT_KINDS as readonly string[]).includes(kind)) {
      if (!slug) fail("new requires a slug");
      assertAllowedOptions(options, kind as ContentKind);
      create(kind as ContentKind, slug, options);
    } else if (kind === "page") {
      if (!slug) fail("new page requires a page name");
      assertAllowedOptions(options, "page");
      createPage(slug, options.get("force") === true);
    } else {
      fail("new accepts article, work, publication, or page");
    }
  } else if (command === "validate") {
    if (positional.length) fail("validate does not accept a path yet");
    assertAllowedOptions(options, "validate");
    validateContent();
    console.log("Content is valid.");
  } else if (command === "media" && positional[0] === "add") {
    if (!positional[1]) fail("media add requires a source path");
    assertAllowedOptions(options, "media add");
    const name = option(options, "name");
    if (!name) fail("media add requires --name");
    addMedia(positional[1], name);
  } else if (command === "media" && positional[0] === "list") {
    assertAllowedOptions(options, "media list");
    listMedia(options.get("unused") === true);
  } else if (command === "build") {
    assertAllowedOptions(options, "build");
    validateContent();
    console.log("Content is valid.");
    run("bun", ["run", "test"]);
    run("bun", ["run", "lint"]);
    run("bun", ["run", "build"]);
  } else {
    fail(`unknown command ${command}`);
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
