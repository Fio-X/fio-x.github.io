import { getContent, hasPageContent, NEWS_CATEGORIES, type ArticleTemplate, type ContentPage } from "@/lib/content";
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

export function categorySlug(category: string) { return category.toLowerCase().replace(/\s+/g, "-"); }
