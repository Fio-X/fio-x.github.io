export const SITE_NAME = "Fio";
export const SITE_DESCRIPTION = "作品、写作与学习记录。";
export const SITE_ORIGIN = "https://fio-x.github.io";

export type NavigationItem =
  | { href: string; label: string; disabled?: false }
  | { label: string; disabled: true; href?: never };

export interface SectionNavItem {
  href?: string;
  label: string;
  current?: boolean;
  disabled?: boolean;
}

export const HOME_NAV_ITEMS: readonly NavigationItem[] = [
  { href: "/archive", label: "latest" },
  { href: "/works", label: "works" },
  { href: "/information", label: "information" },
];

export const CONTENT_NAV_ITEMS: readonly NavigationItem[] = [
  { href: "/archive", label: "news" },
  { href: "/biography", label: "biography" },
  { href: "/works", label: "works" },
  { href: "/publications", label: "publications" },
  { href: "/articles", label: "articles" },
  { href: "/contact", label: "contact" },
  { label: "instagram", disabled: true },
];
