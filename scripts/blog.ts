import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { getReferencedMedia, validateContent } from "../lib/content";

const ROOT = process.cwd();
const CONTENT = resolve(ROOT, "content");
const TEMPLATES = resolve(CONTENT, "templates");
const MEDIA = resolve(ROOT, "public/media");
const PAGE_SLUGS = new Set(["information", "biography", "publications", "contact"]);
const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
function fail(message: string): never { console.error(`blog: ${message}`); process.exit(1); }
function assertSlug(slug: string) { if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail("slug must be lowercase kebab-case"); }
function inside(root: string, path: string) { return path.startsWith(`${root}/`); }
function parseOptions(args: string[]) { const options = new Map<string, string | boolean>(); const positional: string[] = []; for (let index = 0; index < args.length; index++) { const arg = args[index]; if (!arg.startsWith("--")) { positional.push(arg); continue; } const key = arg.slice(2); if (["force", "unused"].includes(key)) { options.set(key, true); continue; } const value = args[++index]; if (!value || value.startsWith("--")) fail(`--${key} requires a value`); options.set(key, value); } return { options, positional }; }
function option(options: Map<string, string | boolean>, key: string) { const value = options.get(key); return typeof value === "string" ? value : undefined; }
function replaceTemplate(template: string, fields: Record<string, string | undefined>) { return Object.entries(fields).reduce((result, [key, value]) => value === undefined ? result : result.replace(new RegExp(`^${key}:.*$`, "m"), `${key}: ${JSON.stringify(value)}`), template); }
function run(command: string, args: string[]) { const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit" }); if (result.status !== 0) process.exit(result.status ?? 1); }
function usage() { console.log(`Usage:
  bun run blog -- new article <slug> --section news|articles [--title TITLE --date YYYY-MM-DD --description TEXT --category NAME --tags a,b]
  bun run blog -- new work <slug> [--title TITLE --date YYYY-MM-DD --summary TEXT --tags a,b]
  bun run blog -- new page <information|biography|publications|contact> [--force]
  bun run blog -- validate
  bun run blog -- media add <source> --name <filename>
  bun run blog -- media list [--unused]
  bun run blog -- build`); }
function create(kind: "article" | "work", slug: string, options: Map<string, string | boolean>) {
  assertSlug(slug); const target = resolve(CONTENT, `${kind}s/${slug}.md`); if (!inside(resolve(CONTENT, `${kind}s`), target)) fail("target is outside the content directory"); if (existsSync(target)) fail(`${target} already exists`);
  const template = readFileSync(join(TEMPLATES, `${kind}.md`), "utf8"); const date = option(options, "date") ?? new Date().toISOString().slice(0, 10);
  const section = option(options, "section"); if (kind === "article" && section !== "news" && section !== "articles") fail("new article requires --section news or --section articles");
  const fields = kind === "article" ? { title: option(options, "title"), date, description: option(options, "description"), category: option(options, "category"), section } : { title: option(options, "title"), date, summary: option(options, "summary") };
  const tags = option(options, "tags"); const source = tags ? replaceTemplate(template, fields).replace(/tags:\n(?:  - .*\n)+/, `tags:\n${tags.split(",").map((tag) => `  - ${JSON.stringify(tag.trim())}`).join("\n")}\n`) : replaceTemplate(template, fields);
  mkdirSync(join(CONTENT, `${kind}s`), { recursive: true }); writeFileSync(target, source); console.log(`Created ${target}`);
}
function createPage(slug: string, force: boolean) { if (!PAGE_SLUGS.has(slug)) fail("new page accepts information, biography, publications, or contact"); const target = resolve(CONTENT, `pages/${slug}.md`); if (existsSync(target) && !force) fail(`${target} already exists; use --force to replace it`); mkdirSync(join(CONTENT, "pages"), { recursive: true }); writeFileSync(target, replaceTemplate(readFileSync(join(TEMPLATES, "page.md"), "utf8"), { title: slug })); console.log(`Created ${target}`); }
function addMedia(sourceArgument: string, name: string) { const source = resolve(ROOT, sourceArgument); if (!existsSync(source) || !statSync(source).isFile()) fail("source must be an existing file inside this repository"); if (!inside(ROOT, source)) fail("source must be inside this repository"); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(avif|gif|jpeg|jpg|png|webp)$/i.test(name)) fail("--name must be lowercase kebab-case with an allowed image extension"); if (!IMAGE_EXTENSIONS.has(extname(name).toLowerCase()) || !IMAGE_EXTENSIONS.has(extname(source).toLowerCase())) fail("source and target must use allowed image extensions"); const target = resolve(MEDIA, name); if (!inside(MEDIA, target)) fail("target is outside public/media"); if (existsSync(target)) fail(`${target} already exists`); mkdirSync(MEDIA, { recursive: true }); cpSync(source, target, { errorOnExist: true }); console.log(`Added /media/${name}`); }
function listMedia(unused: boolean) { if (!existsSync(MEDIA)) return; const references = getReferencedMedia(); for (const file of readdirSync(MEDIA).filter((name) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase())).sort()) { const path = `/media/${file}`; if (!unused || !references.has(path)) console.log(`${references.has(path) ? "used" : "unused"}\t${path}`); } }
const [command, ...args] = process.argv.slice(2); if (!command || command === "help" || command === "--help") { usage(); process.exit(0); } const { options, positional } = parseOptions(args);
try { if (command === "new") { const [kind, slug] = positional; if (kind === "article" || kind === "work") { if (!slug) fail("new requires a slug"); create(kind, slug, options); } else if (kind === "page") { if (!slug) fail("new page requires a page name"); createPage(slug, options.get("force") === true); } else fail("new accepts article, work, or page"); } else if (command === "validate") { if (positional.length) fail("validate does not accept a path yet"); validateContent(); console.log("Content is valid."); } else if (command === "media" && positional[0] === "add") { if (!positional[1]) fail("media add requires a source path"); const name = option(options, "name"); if (!name) fail("media add requires --name"); addMedia(positional[1], name); } else if (command === "media" && positional[0] === "list") listMedia(options.get("unused") === true); else if (command === "build") { validateContent(); console.log("Content is valid."); run("bun", ["run", "test"]); run("bun", ["run", "lint"]); run("bun", ["run", "build"]); } else fail(`unknown command ${command}`); } catch (error) { fail(error instanceof Error ? error.message : String(error)); }
