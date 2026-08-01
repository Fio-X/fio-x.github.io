import { getPage, hasPageContent } from "./content";
import { sitePath } from "./site-constants";
export { SITE_DESCRIPTION, SITE_NAME, SITE_ORIGIN } from "./site-constants";

export type NavigationItem =
  | { href: string; label: string; external?: boolean; disabled?: false }
  | { label: string; disabled: true; href?: never };

export interface SectionNavItem {
  href?: string;
  label: string;
  current?: boolean;
  disabled?: boolean;
}

export function homeNavItemsFromContent(state?: { hasNews?: boolean; hasWorks?: boolean; hasInformation?: boolean }): NavigationItem[] {
  void state;
  return [
    { href: sitePath("/news"), label: "Latest" },
    { href: sitePath("/works"), label: "Works" },
    { href: sitePath("/information"), label: "Information" },
  ];
}

export function homeNavItems(): NavigationItem[] { return homeNavItemsFromContent(); }

export function contentNavItems(): NavigationItem[] {
  return [
    { href: sitePath("/news"), label: "News" },
    { href: sitePath("/biography"), label: "Biography" },
    { href: sitePath("/works"), label: "Works" },
    { href: sitePath("/publications"), label: "Publications" },
    { href: sitePath("/contact"), label: "Contact" },
    { href: sitePath("/information"), label: "Information" },
  ];
}

export function pageHasPublicContent(slug: "information" | "biography" | "contact") {
  return hasPageContent(getPage(slug));
}
