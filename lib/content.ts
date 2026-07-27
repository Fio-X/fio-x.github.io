import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";

const CONTENT_DIRECTORY = join(process.cwd(), "content");
const ARTICLE_DIRECTORY = join(CONTENT_DIRECTORY, "articles");
const WORK_DIRECTORY = join(CONTENT_DIRECTORY, "works");
const PAGE_DIRECTORY = join(CONTENT_DIRECTORY, "pages");
const PAGE_SLUGS = ["information", "biography", "publications", "contact"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
const PUBLIC_DIRECTORY = join(process.cwd(), "public");
const PUBLIC_MEDIA_PREFIX = "/media/";
const MEDIA_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;

export const STATIC_EXPORT_PLACEHOLDER_SLUG = "__static-export-placeholder__";

export interface MediaItem {
  src: string;
  alt: string;
  decorative: boolean;
}

export type ArticleSection = "news" | "articles";

export interface Article {
  slug: string;
  section: ArticleSection;
  title: string;
  date: string;
  updated?: string;
  description: string;
  category: string;
  tags: string[];
  draft: boolean;
  cover?: string;
  body: string;
}

export interface Work {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  summary: string;
  status?: string;
  projectUrl?: string;
  tags: string[];
  draft: boolean;
  cover?: string;
  media: MediaItem[];
  body: string;
}

export interface PageSection {
  id: string;
  label: string;
}

export interface ContentPage {
  slug: PageSlug;
  title: string;
  description?: string;
  sections: PageSection[];
  body: string;
}

export interface ContentCollection {
  articles: Article[];
  works: Work[];
  categories: string[];
  tags: string[];
}

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

export function contentHref(slug: string) { return `/articles/${slug}`; }
export function workHref(slug: string) { return `/works/${slug}`; }
export function categoryHref(category: string) { return `/categories/${encodeURIComponent(category)}`; }
export function tagHref(tag: string) { return `/tags/${encodeURIComponent(tag)}`; }

export function getContent(): ContentCollection {
  const articles = readCollection(ARTICLE_DIRECTORY, parseArticle);
  const works = readCollection(WORK_DIRECTORY, parseWork);
  assertUniqueSlugs(articles, "article");
  assertUniqueSlugs(works, "work");

  const publishedArticles = articles.filter((article) => !article.draft).sort(byNewest);
  const publishedWorks = works.filter((work) => !work.draft).sort(byNewest);
  return {
    articles: publishedArticles,
    works: publishedWorks,
    categories: uniqueSorted(publishedArticles.map((article) => article.category)),
    tags: uniqueSorted([...publishedArticles.flatMap((article) => article.tags), ...publishedWorks.flatMap((work) => work.tags)]),
  };
}

export function validateContent() {
  getContent();
  for (const slug of PAGE_SLUGS) getPage(slug);
}

export function getReferencedMedia() {
  const { articles, works } = getContent();
  return new Set([
    ...articles.flatMap((article) => article.cover ? [article.cover] : []),
    ...works.flatMap((work) => [
      ...(work.cover ? [work.cover] : []),
      ...work.media.map((media) => media.src),
    ]),
  ]);
}

export function getArticleBySlug(slug: string) { return getContent().articles.find((article) => article.slug === slug); }
export function getWorkBySlug(slug: string) { return getContent().works.find((work) => work.slug === slug); }
export function getArticlesForCategory(category: string) { return getContent().articles.filter((article) => article.category === category); }
export function getArticlesForTag(tag: string) { return getContent().articles.filter((article) => article.tags.includes(tag)); }
export function getArticlesForSection(section: ArticleSection) { return getContent().articles.filter((article) => article.section === section); }

export function getPage(slug: PageSlug): ContentPage | undefined {
  const file = join(PAGE_DIRECTORY, `${slug}.md`);
  if (!existsSync(file)) return undefined;
  const document = parseDocument(file);
  const data = expectObject(document.data, file);
  assertAllowedKeys(data, ["title", "description", "sections"], file);
  assertMarkdownImages(document.content, file);
  const sections = requiredPageSections(data, file, document.content);
  return { slug, title: requiredString(data, "title", file), description: optionalString(data, "description", file), sections, body: document.content.trim() };
}

export function getAboutPage() { return getPage("information"); }
export function pageSlugs() { return PAGE_SLUGS; }

function readCollection<T>(directory: string, parse: (slug: string, file: string) => T): T[] {
  try {
    return readdirSync(directory).filter((filename) => filename.endsWith(".md")).sort().map((filename) => {
      const slug = filename.slice(0, -3);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ContentValidationError(`${join(directory, filename)}: filename must be a lowercase kebab-case slug`);
      return parse(slug, join(directory, filename));
    });
  } catch (error) {
    if (isMissingFile(error)) return [];
    throw error;
  }
}

function parseArticle(slug: string, file: string): Article {
  const document = parseDocument(file);
  const data = expectObject(document.data, file);
  assertAllowedKeys(data, ["title", "date", "updated", "description", "category", "section", "tags", "draft", "cover"], file);
  assertMarkdownImages(document.content, file);
  return {
    slug, section: requiredArticleSection(data, file), title: requiredString(data, "title", file), date: requiredDate(data, "date", file), updated: optionalDate(data, "updated", file),
    description: requiredString(data, "description", file), category: requiredString(data, "category", file), tags: requiredTags(data, file),
    draft: optionalBoolean(data, "draft", file), cover: optionalMediaPath(data, "cover", file), body: document.content.trim(),
  };
}

function parseWork(slug: string, file: string): Work {
  const document = parseDocument(file);
  const data = expectObject(document.data, file);
  assertAllowedKeys(data, ["title", "date", "updated", "summary", "status", "projectUrl", "tags", "draft", "cover", "media"], file);
  assertMarkdownImages(document.content, file);
  return {
    slug, title: requiredString(data, "title", file), date: requiredDate(data, "date", file), updated: optionalDate(data, "updated", file),
    summary: requiredString(data, "summary", file), status: optionalString(data, "status", file), projectUrl: optionalUrl(data, "projectUrl", file),
    tags: requiredTags(data, file), draft: optionalBoolean(data, "draft", file), cover: optionalMediaPath(data, "cover", file), media: requiredMedia(data, file), body: document.content.trim(),
  };
}

function parseDocument(file: string) {
  try { return matter(readFileSync(file, "utf8")); }
  catch (error) { throw new ContentValidationError(`${file}: could not parse frontmatter (${error instanceof Error ? error.message : String(error)})`); }
}

function expectObject(value: unknown, file: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ContentValidationError(`${file}: frontmatter must be an object`);
  return value as Record<string, unknown>;
}

function assertAllowedKeys(data: Record<string, unknown>, allowedKeys: string[], file: string) {
  const unknownKeys = Object.keys(data).filter((key) => !allowedKeys.includes(key));
  if (unknownKeys.length) throw new ContentValidationError(`${file}: unsupported frontmatter keys: ${unknownKeys.join(", ")}`);
}

function requiredString(data: Record<string, unknown>, key: string, file: string) {
  const value = optionalString(data, key, file);
  if (!value) throw new ContentValidationError(`${file}: ${key} must be a non-empty string`);
  return value;
}

function optionalString(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) throw new ContentValidationError(`${file}: ${key} must be a non-empty string`);
  return value.trim();
}

function requiredDate(data: Record<string, unknown>, key: string, file: string) {
  const value = optionalDate(data, key, file);
  if (!value) throw new ContentValidationError(`${file}: ${key} must be an ISO date (YYYY-MM-DD)`);
  return value;
}

function optionalDate(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new ContentValidationError(`${file}: ${key} must be an ISO date (YYYY-MM-DD)`);
  return value;
}

function requiredArticleSection(data: Record<string, unknown>, file: string): ArticleSection {
  const section = requiredString(data, "section", file);
  if (section !== "news" && section !== "articles") throw new ContentValidationError(`${file}: section must be news or articles`);
  return section;
}

function requiredPageSections(data: Record<string, unknown>, file: string, body: string): PageSection[] {
  const value = data.sections;
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new ContentValidationError(`${file}: sections must be an array`);
  const sections = value.map((item, index) => {
    const entry = expectObject(item, `${file}: sections[${index}]`);
    assertAllowedKeys(entry, ["id", "label"], `${file}: sections[${index}]`);
    const id = requiredString(entry, "id", `${file}: sections[${index}]`);
    const label = requiredString(entry, "label", `${file}: sections[${index}]`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new ContentValidationError(`${file}: sections[${index}].id must be lowercase kebab-case`);
    if (!new RegExp(`^##\\s+${escapeRegExp(label)}\\s*$`, "m").test(body)) throw new ContentValidationError(`${file}: sections[${index}].label must match a Markdown level-two heading`);
    return { id, label };
  });
  if (new Set(sections.map((section) => section.id)).size !== sections.length) throw new ContentValidationError(`${file}: sections must not contain duplicate ids`);
  return sections;
}

function requiredTags(data: Record<string, unknown>, file: string) {
  const value = data.tags;
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== "string" || !tag.trim())) throw new ContentValidationError(`${file}: tags must be an array of non-empty strings`);
  const tags = value.map((tag) => tag.trim());
  if (new Set(tags).size !== tags.length) throw new ContentValidationError(`${file}: tags must not contain duplicates`);
  return tags.sort((a, b) => a.localeCompare(b));
}

function optionalBoolean(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (value === undefined) return false;
  if (typeof value !== "boolean") throw new ContentValidationError(`${file}: ${key} must be a boolean`);
  return value;
}

function optionalMediaPath(data: Record<string, unknown>, key: string, file: string) {
  const value = optionalString(data, key, file);
  return value ? validateMediaPath(value, file, key) : undefined;
}

function requiredMedia(data: Record<string, unknown>, file: string): MediaItem[] {
  const value = data.media;
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new ContentValidationError(`${file}: media must be an array`);
  const media = value.map((item, index) => {
    const entry = expectObject(item, `${file}: media[${index}]`);
    assertAllowedKeys(entry, ["src", "alt", "decorative"], `${file}: media[${index}]`);
    const decorative = entry.decorative === true;
    if (entry.decorative !== undefined && typeof entry.decorative !== "boolean") throw new ContentValidationError(`${file}: media[${index}].decorative must be a boolean`);
    const src = validateMediaPath(requiredString(entry, "src", `${file}: media[${index}]`), file, `media[${index}].src`);
    const alt = entry.alt;
    if (typeof alt !== "string" || (alt.trim() === "" && !decorative)) throw new ContentValidationError(`${file}: media[${index}].alt must be non-empty unless decorative is true`);
    return { src, alt: alt.trim(), decorative };
  });
  if (new Set(media.map((item) => item.src)).size !== media.length) throw new ContentValidationError(`${file}: media paths must not contain duplicates`);
  return media;
}

function validateMediaPath(value: string, file: string, key: string) {
  if (!value.startsWith(PUBLIC_MEDIA_PREFIX) || value.includes("..") || value.includes("\\")) throw new ContentValidationError(`${file}: ${key} must be a local ${PUBLIC_MEDIA_PREFIX} path`);
  const extension = value.slice(value.lastIndexOf(".")).toLowerCase();
  if (!MEDIA_EXTENSIONS.has(extension)) throw new ContentValidationError(`${file}: ${key} must use an allowed image extension`);
  const absolutePath = resolve(PUBLIC_DIRECTORY, `.${value}`);
  if (!absolutePath.startsWith(`${PUBLIC_DIRECTORY}/`) || !existsSync(absolutePath)) throw new ContentValidationError(`${file}: ${key} references a missing public media file`);
  return value;
}

function assertMarkdownImages(body: string, file: string) {
  for (const match of body.matchAll(MARKDOWN_IMAGE_PATTERN)) validateMediaPath(match[1], file, "Markdown image");
}

function optionalUrl(data: Record<string, unknown>, key: string, file: string) {
  const value = optionalString(data, key, file);
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("unsupported protocol");
    return url.toString();
  } catch { throw new ContentValidationError(`${file}: ${key} must be an absolute http(s) URL`); }
}

function assertUniqueSlugs(records: Array<{ slug: string }>, kind: string) {
  const seen = new Set<string>();
  for (const record of records) { if (seen.has(record.slug)) throw new ContentValidationError(`${kind}: duplicate slug ${record.slug}`); seen.add(record.slug); }
}

function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function uniqueSorted(values: string[]) { return [...new Set(values)].sort((a, b) => a.localeCompare(b)); }
function byNewest<T extends { date: string; updated?: string; slug: string }>(a: T, b: T) { return (b.updated ?? b.date).localeCompare(a.updated ?? a.date) || a.slug.localeCompare(b.slug); }
function isMissingFile(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT"; }
