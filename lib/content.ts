import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import matter from "gray-matter";
import { sitePath } from "@/lib/site-constants";

const contentDirectory = () => join(process.cwd(), "content");
const articleDirectory = () => join(contentDirectory(), "articles");
const workDirectory = () => join(contentDirectory(), "works");
const publicationDirectory = () => join(contentDirectory(), "publications");
const pageDirectory = () => join(contentDirectory(), "pages");
const PAGE_SLUGS = ["information", "biography", "contact"] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];
const publicDirectory = () => join(process.cwd(), "public");
const PUBLIC_MEDIA_PREFIX = "/media/";
const MEDIA_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;

export const STATIC_EXPORT_PLACEHOLDER_SLUG = "__static-export-placeholder__";
export const WORK_KINDS = ["photography", "software", "hardware", "mixed"] as const;
export type WorkKind = (typeof WORK_KINDS)[number];

export interface MediaItem {
  src: string;
  alt: string;
  decorative: boolean;
}

export type MediaGroupLayout = "single" | "pair";

export interface MediaGroup {
  layout: MediaGroupLayout;
  items: MediaItem[];
}

export const ARTICLE_TEMPLATES = ["essay", "image-notes", "conversation"] as const;
export type ArticleTemplate = (typeof ARTICLE_TEMPLATES)[number];
/** Legacy values are accepted only by compatibility helpers, never by new content. */
export type ArticleSection = "information" | "news" | "articles";
export const ARTICLE_SECTIONS = ["information"] as const;

export const NEWS_CATEGORIES = ["Event", "Group Exhibition", "News", "Publication", "Solo Exhibition"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface NewsMeta {
  category?: NewsCategory;
  dateLabel?: string;
  place?: string;
  placeUrl?: string;
}

export interface Article {
  slug: string;
  /** Legacy frontmatter is normalized to information during parsing. */
  section: ArticleSection;
  template: ArticleTemplate;
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
  kind: WorkKind;
  title: string;
  date: string;
  updated?: string;
  summary: string;
  role?: string;
  status?: string;
  projectUrl?: string;
  tags: string[];
  draft: boolean;
  cover?: string;
  /** Flat media remains available for simple work files and backwards compatibility. */
  media: MediaItem[];
  /** Explicit groups reproduce the prototype's single / pair media stream. */
  mediaGroups: MediaGroup[];
  body: string;
}

export interface Publication {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description?: string;
  publisher?: string;
  authors?: string[];
  draft: boolean;
  cover?: string;
  coverAlt?: string;
  body: string;
}

export interface PageSection {
  id: string;
  label: string;
}

export interface TimelineEntry {
  section: string;
  year: string;
  text: string;
}

export interface ContentPage {
  slug: PageSlug;
  title: string;
  date?: string;
  updated?: string;
  description?: string;
  draft: boolean;
  sections: PageSection[];
  timeline: TimelineEntry[];
  body: string;
}

export interface ContentCollection {
  articles: Article[];
  works: Work[];
  publications: Publication[];
  categories: string[];
  tags: string[];
}

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

export function contentHref(slug: string, section: ArticleSection = "information") {
  void section;
  return sitePath(`/information/${slug}`);
}
export function articleHref(article: Pick<Article, "slug">) { return contentHref(article.slug); }
export function workHref(slug: string) { return sitePath(`/works/${slug}`); }
export function categoryHref(category: string) { return sitePath(`/categories/${encodeURIComponent(category)}`); }
export function tagHref(tag: string) { return sitePath(`/tags/${encodeURIComponent(tag)}`); }

export function staticSlugParams(slugs: readonly string[]) {
  return (slugs.length > 0 ? slugs : [STATIC_EXPORT_PLACEHOLDER_SLUG]).map((slug) => ({ slug }));
}

export function getContent(): ContentCollection {
  const articles = readCollection(articleDirectory(), parseArticle);
  const works = readCollection(workDirectory(), parseWork);
  const publications = readCollection(publicationDirectory(), parsePublication);
  assertUniqueSlugs(articles, "article");
  assertUniqueSlugs(works, "work");
  assertUniqueSlugs(publications, "publication");

  const publishedArticles = articles.filter((article) => !article.draft).sort(byNewest);
  const publishedWorks = works.filter((work) => !work.draft).sort(byNewest);
  const publishedPublications = publications.filter((publication) => !publication.draft).sort(byNewest);
  return {
    articles: publishedArticles,
    works: publishedWorks,
    publications: publishedPublications,
    categories: uniqueSorted(publishedArticles.map((article) => article.category)),
    tags: uniqueSorted([...publishedArticles.flatMap((article) => article.tags), ...publishedWorks.flatMap((work) => work.tags)]),
  };
}

export function validateContent() {
  getContent();
  for (const slug of PAGE_SLUGS) getPage(slug);
}

export function getReferencedMedia() {
  const { articles, works, publications } = getContent();
  return new Set([
    ...articles.flatMap((article) => article.cover ? [article.cover] : []),
    ...works.flatMap((work) => [
      ...(work.cover ? [work.cover] : []),
      ...work.media.map((media) => media.src),
      ...work.mediaGroups.flatMap((group) => group.items.map((media) => media.src)),
    ]),
    ...publications.flatMap((publication) => publication.cover ? [publication.cover] : []),
  ]);
}

export function getArticleBySlug(slug: string, sections?: readonly ArticleSection[]) {
  void sections;
  return getContent().articles.find((article) => article.slug === slug);
}
export function getWorkBySlug(slug: string) { return getContent().works.find((work) => work.slug === slug); }
export function getArticlesForCategory(category: string) { return getContent().articles.filter((article) => article.category === category); }
export function getArticlesForTag(tag: string) { return getContent().articles.filter((article) => article.tags.includes(tag)); }
export function getWorksForTag(tag: string) { return getContent().works.filter((work) => work.tags.includes(tag)); }
export function getArticlesForSection(section: ArticleSection = "information") {
  void section;
  return getContent().articles;
}

export function hasPageContent(page: ContentPage | undefined) {
  return Boolean(page && !page.draft && (page.body.trim() || page.sections.length > 0 || page.timeline.length > 0));
}

export function getPage(slug: PageSlug): ContentPage | undefined {
  const file = join(pageDirectory(), `${slug}.md`);
  if (!existsSync(file)) return undefined;
  const document = parseDocument(file);
  const data = expectObject(document.data, file);
  assertAllowedKeys(data, ["title", "date", "updated", "description", "sections", "timeline", "draft"], file);
  assertMarkdownImages(document.content, file);
  const sections = requiredPageSections(data, file, document.content);
  const timeline = requiredTimeline(data, file);
  return { slug, title: requiredString(data, "title", file), date: optionalDate(data, "date", file), updated: optionalDate(data, "updated", file), description: optionalString(data, "description", file), draft: optionalBoolean(data, "draft", file), sections, timeline, body: document.content.trim() };
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
  assertAllowedKeys(data, ["title", "date", "updated", "description", "category", "section", "template", "tags", "draft", "cover"], file);
  assertMarkdownImages(document.content, file);
  return {
    slug, section: "information", template: requiredArticleTemplate(data, file), title: requiredString(data, "title", file), date: requiredDate(data, "date", file), updated: optionalDate(data, "updated", file),
    description: requiredString(data, "description", file), category: requiredString(data, "category", file), tags: requiredTags(data, file),
    draft: optionalBoolean(data, "draft", file), cover: optionalMediaPath(data, "cover", file), body: document.content.trim(),
  };
}

function parseWork(slug: string, file: string): Work {
  const document = parseDocument(file);
  const data = expectObject(document.data, file);
  assertAllowedKeys(data, ["kind", "title", "date", "updated", "summary", "role", "status", "projectUrl", "tags", "draft", "cover", "media", "mediaGroups"], file);
  assertMarkdownImages(document.content, file);
  const media = requiredMedia(data, file);
  const mediaGroups = requiredMediaGroups(data, file, media);
  return {
    slug, kind: requiredWorkKind(data, file), title: requiredString(data, "title", file), date: requiredDate(data, "date", file), updated: optionalDate(data, "updated", file),
    summary: requiredString(data, "summary", file), role: optionalString(data, "role", file), status: optionalString(data, "status", file), projectUrl: optionalUrl(data, "projectUrl", file),
    tags: requiredTags(data, file), draft: optionalBoolean(data, "draft", file), cover: optionalMediaPath(data, "cover", file), media, mediaGroups, body: document.content.trim(),
  };
}

function parsePublication(slug: string, file: string): Publication {
  const document = parseDocument(file);
  const data = expectObject(document.data, file);
  assertAllowedKeys(data, ["title", "date", "updated", "description", "publisher", "authors", "draft", "cover", "coverAlt"], file);
  assertMarkdownImages(document.content, file);
  return {
    slug, title: requiredString(data, "title", file), date: requiredDate(data, "date", file), updated: optionalDate(data, "updated", file),
    description: optionalString(data, "description", file), publisher: optionalString(data, "publisher", file), authors: optionalStrings(data, "authors", file),
    draft: optionalBoolean(data, "draft", file), cover: optionalMediaPath(data, "cover", file), coverAlt: optionalString(data, "coverAlt", file), body: document.content.trim(),
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

function optionalStrings(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) throw new ContentValidationError(`${file}: ${key} must be an array of non-empty strings`);
  return value.map((item) => (item as string).trim());
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

function requiredArticleTemplate(data: Record<string, unknown>, file: string): ArticleTemplate {
  const template = optionalString(data, "template", file) ?? "essay";
  if (!ARTICLE_TEMPLATES.includes(template as ArticleTemplate)) throw new ContentValidationError(`${file}: template must be essay, image-notes, or conversation`);
  return template as ArticleTemplate;
}

function requiredWorkKind(data: Record<string, unknown>, file: string): WorkKind {
  const kind = optionalString(data, "kind", file) ?? "photography";
  if (!WORK_KINDS.includes(kind as WorkKind)) throw new ContentValidationError(`${file}: kind must be photography, software, hardware, or mixed`);
  return kind as WorkKind;
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

function requiredTimeline(data: Record<string, unknown>, file: string): TimelineEntry[] {
  const value = data.timeline;
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new ContentValidationError(`${file}: timeline must be an array`);
  return value.map((item, index) => {
    const entry = expectObject(item, `${file}: timeline[${index}]`);
    assertAllowedKeys(entry, ["section", "year", "text"], `${file}: timeline[${index}]`);
    return {
      section: requiredString(entry, "section", `${file}: timeline[${index}]`),
      year: requiredString(entry, "year", `${file}: timeline[${index}]`),
      text: requiredString(entry, "text", `${file}: timeline[${index}]`),
    };
  });
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
  return parseMediaItems(value, file, "media");
}

function requiredMediaGroups(data: Record<string, unknown>, file: string, flatMedia: MediaItem[]): MediaGroup[] {
  const value = data.mediaGroups;
  if (value === undefined) return flatMedia.map((item) => ({ layout: "single", items: [item] }));
  if (!Array.isArray(value)) throw new ContentValidationError(`${file}: mediaGroups must be an array`);
  const groups = value.map((item, index) => {
    const entry = expectObject(item, `${file}: mediaGroups[${index}]`);
    assertAllowedKeys(entry, ["layout", "items"], `${file}: mediaGroups[${index}]`);
    const layout = requiredString(entry, "layout", `${file}: mediaGroups[${index}]`);
    if (layout !== "single" && layout !== "pair") throw new ContentValidationError(`${file}: mediaGroups[${index}].layout must be single or pair`);
    const items = entry.items;
    if (!Array.isArray(items)) throw new ContentValidationError(`${file}: mediaGroups[${index}].items must be an array`);
    const parsedItems = parseMediaItems(items, file, `mediaGroups[${index}].items`);
    if (layout === "single" && parsedItems.length !== 1) throw new ContentValidationError(`${file}: mediaGroups[${index}] with single layout must contain one item`);
    if (layout === "pair" && parsedItems.length !== 2) throw new ContentValidationError(`${file}: mediaGroups[${index}] with pair layout must contain two items`);
    return { layout, items: parsedItems } as MediaGroup;
  });
  if (flatMedia.length > 0 && groups.length > 0) throw new ContentValidationError(`${file}: use media or mediaGroups, not both`);
  return groups;
}

function parseMediaItems(value: unknown[], file: string, key: string): MediaItem[] {
  const media = value.map((item, index) => {
    const entry = expectObject(item, `${file}: ${key}[${index}]`);
    assertAllowedKeys(entry, ["src", "alt", "decorative"], `${file}: ${key}[${index}]`);
    const decorative = entry.decorative === true;
    if (entry.decorative !== undefined && typeof entry.decorative !== "boolean") throw new ContentValidationError(`${file}: ${key}[${index}].decorative must be a boolean`);
    const src = validateMediaPath(requiredString(entry, "src", `${file}: ${key}[${index}]`), file, `${key}[${index}].src`);
    const alt = entry.alt;
    if (typeof alt !== "string" || (alt.trim() === "" && !decorative)) throw new ContentValidationError(`${file}: ${key}[${index}].alt must be non-empty unless decorative is true`);
    return { src, alt: alt.trim(), decorative };
  });
  if (new Set(media.map((item) => item.src)).size !== media.length) throw new ContentValidationError(`${file}: media paths must not contain duplicates`);
  return media;
}

function validateMediaPath(value: string, file: string, key: string) {
  if (!value.startsWith(PUBLIC_MEDIA_PREFIX) || value.includes("..") || value.includes("\\")) throw new ContentValidationError(`${file}: ${key} must be a local ${PUBLIC_MEDIA_PREFIX} path`);
  const extension = value.slice(value.lastIndexOf(".")).toLowerCase();
  if (!MEDIA_EXTENSIONS.has(extension)) throw new ContentValidationError(`${file}: ${key} must use an allowed image extension`);
  const publicRoot = publicDirectory();
  const absolutePath = resolve(publicRoot, `.${value}`);
  if (!absolutePath.startsWith(`${publicRoot}/`) || !existsSync(absolutePath)) throw new ContentValidationError(`${file}: ${key} references a missing public media file`);
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
