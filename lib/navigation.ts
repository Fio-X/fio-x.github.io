import { categoryHref, getContent, hasPageContent, NEWS_CATEGORIES, type ArticleTemplate, type ContentPage } from "@/lib/content";
import { getNewsEntries } from "@/lib/news";
import type { SectionNavItem } from "./site";
import { sitePath } from "./site-constants";

const TEMPLATE_LABELS: Record<ArticleTemplate, string> = { essay: "Essay", "image-notes": "Image Notes", conversation: "Conversation" };

export function newsSectionItems(currentPath = "/news/"): SectionNavItem[] {
  const current = sitePath(currentPath);
  return [
    { href: sitePath("/news"), label: "All", current: current === sitePath("/news") || current.startsWith(sitePath("/news/page/")) },
    ...NEWS_CATEGORIES.map((category) => ({ href: sitePath(`/news/category/${categorySlug(category)}`), label: category, current: current === sitePath(`/news/category/${categorySlug(category)}`) })),
  ];
}

export function informationSectionItems(currentPath = "/information/", currentTemplate?: ArticleTemplate, page?: ContentPage): SectionNavItem[] {
  const current = sitePath(currentPath);
  return [
    { href: sitePath("/information"), label: "All entries", current: current === sitePath("/information") },
    ...Object.entries(TEMPLATE_LABELS).map(([template, label]) => ({ href: sitePath(`/information/type/${template}`), label, current: currentTemplate === template || current === sitePath(`/information/type/${template}`) })),
    ...(page !== undefined && hasPageContent(page) ? page.sections.map((section) => ({ href: `#${section.id}`, label: section.label })) : []),
  ];
}

export function workSectionItems(currentPath?: string): SectionNavItem[] {
  const current = currentPath ? sitePath(currentPath) : undefined;
  const works = getContent().works;
  if (works.length === 0) return [];
  return works.map((work) => ({
    href: sitePath(`/works/${work.slug}`),
    label: work.title,
    current: current === sitePath(`/works/${work.slug}`),
  }));
}

export function pageSectionItems(page: ContentPage | undefined): SectionNavItem[] {
  return page?.sections.map((section) => ({ href: `#${section.id}`, label: section.label })) ?? [];
}

export function categorySectionItems(currentPath?: string): SectionNavItem[] {
  return getNewsEntries().map((entry) => ({ href: categoryHref(entry.category), label: entry.category, current: currentPath === categoryHref(entry.category) }));
}

export function categorySlug(category: string) { return category.toLowerCase().replace(/\s+/g, "-"); }

/** Compatibility exports for legacy routes during the Information-only migration. */
export function articleSectionItems(_section: "articles" | "information", currentPath = "/information/") {
  return informationSectionItems(currentPath);
}
export function contentSectionItems(_section: "articles" | "information" | "news", currentPath: string) {
  return informationSectionItems(currentPath);
}
export function aggregationContext(sections: readonly string[], hasWorks = false) { void sections; void hasWorks; return sitePath("/information"); }
export function availableContentSections() {
  return { news: true, biography: true, works: true, publications: true, articles: false, contact: true, information: true };
}
