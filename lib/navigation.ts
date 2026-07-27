import { categoryHref, getContent, workHref } from "@/lib/content";
import type { ArticleSection, ContentPage } from "@/lib/content";
import type { SectionNavItem } from "./site";

export function archiveSectionItems(currentPath?: string): SectionNavItem[] {
  const { categories } = getContent();
  return [
    { href: "/archive", label: "all", current: currentPath === "/archive" },
    ...categories.map((category) => ({ href: categoryHref(category), label: category, current: currentPath === categoryHref(category) })),
  ];
}

export function workSectionItems(currentPath?: string): SectionNavItem[] {
  return getContent().works.map((work) => ({ href: workHref(work.slug), label: work.title, current: currentPath === workHref(work.slug) }));
}

export function articleSectionItems(section: ArticleSection, currentPath?: string): SectionNavItem[] {
  const articles = getContent().articles.filter((article) => article.section === section);
  return articles.map((article) => ({ href: `/articles/${article.slug}`, label: article.title, current: currentPath === `/articles/${article.slug}` }));
}

export function pageSectionItems(page: ContentPage | undefined): SectionNavItem[] {
  return page?.sections.map((section) => ({ href: `#${section.id}`, label: section.label })) ?? [];
}
