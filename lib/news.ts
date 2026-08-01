import { articleHref, getContent, getPage, hasPageContent, type Article, type ContentPage, type NewsCategory, type Publication, type Work, NEWS_CATEGORIES, workHref } from "./content";
import { sitePath } from "./site-constants";

export interface NewsEntry {
  id: string;
  source: "article" | "work" | "publication" | "page";
  category: NewsCategory;
  title: string;
  date: string;
  dateLabel?: string;
  place?: string;
  placeUrl?: string;
  description?: string;
  href: string;
  cover?: string;
  coverAlt?: string;
}

export function getNewsEntries() {
  return projectNewsEntries(getContent(), (["information", "biography", "contact"] as const).map((slug) => getPage(slug)));
}

export function projectNewsEntries(content: ReturnType<typeof getContent>, pages: Array<ContentPage | undefined> = []) {
  const entries = [
    ...content.articles.map(articleEntry),
    ...content.works.map(workEntry),
    ...content.publications.map(publicationEntry),
    ...pages.filter((page): page is ContentPage & { updated: string } => page !== undefined && hasPageContent(page) && page.updated !== undefined).map(pageEntry),
  ];
  return entries.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function newsCategories() { return [...NEWS_CATEGORIES]; }

function articleEntry(article: Article): NewsEntry {
  return {
    id: `information:${article.slug}`,
    source: "article",
    category: "News",
    title: article.title,
    date: article.updated ?? article.date,
    dateLabel: article.date,
    description: article.description,
    href: articleHref(article),
    cover: article.cover,
    coverAlt: "",
  };
}

function workEntry(work: Work): NewsEntry {
  return {
    id: `work:${work.slug}`,
    source: "work",
    category: "News",
    title: work.title,
    date: work.updated ?? work.date,
    dateLabel: work.date,
    description: work.summary,
    href: workHref(work.slug),
    cover: work.cover,
    coverAlt: "",
  };
}

function publicationEntry(publication: Publication): NewsEntry {
  return {
    id: `publication:${publication.slug}`,
    source: "publication",
    category: "Publication",
    title: publication.title,
    date: publication.updated ?? publication.date,
    dateLabel: publication.date,
    description: publication.description,
    href: sitePath(`/publications/${publication.slug}`),
    cover: publication.cover,
    coverAlt: publication.coverAlt,
  };
}

function pageEntry(page: ContentPage): NewsEntry {
  return {
    id: `page:${page.slug}`,
    source: "page",
    category: "News",
    title: page.title,
    date: page.updated as string,
    description: page.description,
    href: sitePath(`/${page.slug}`),
  };
}
