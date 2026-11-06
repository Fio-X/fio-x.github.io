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

/** Home page entries are fixed public destinations, independent of how much content exists. */
export function homeNavItems(): NavigationItem[] {
  return [
    { href: sitePath("/news"), label: "Latest" },
    { href: sitePath("/works"), label: "Works" },
    { href: sitePath("/information"), label: "Information" },
  ];
}

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
