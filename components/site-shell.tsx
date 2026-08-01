import Link from "next/link";
import type { ReactNode } from "react";
import { contentNavItems, type SectionNavItem, SITE_NAME } from "@/lib/site";
import { MobileMenu } from "./mobile-menu";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { SkipLink } from "./skip-link";

export function SiteShell({ children, currentPath, layout = "reading", sectionItems = [] }: { children: ReactNode; currentPath?: string; layout?: "reading" | "work"; sectionItems?: readonly SectionNavItem[] }) {
  const navigationItems = contentNavItems();
  return <><SkipLink /><div className={`site-shell site-shell-${layout}`}><header className="header site-header"><div className="header-inner"><div className="logo"><Link href="/" className="site-identity">{SITE_NAME}</Link></div><div className="nav pc-nav"><div className="nav-inner-01"><SiteNav currentPath={currentPath} items={navigationItems} /><p className="site-language">EN / CN</p></div><div className="nav-inner-02">{sectionItems.length > 0 && <SectionNav items={sectionItems} />}</div></div><MobileMenu currentPath={currentPath} items={navigationItems} sectionItems={sectionItems} /></div></header><main id="main-content" tabIndex={-1} className={`main page-main ${layout === "work" ? "work-column" : "main-column"}`}><div className="page-inner">{children}</div></main></div><SiteFooter /></>;
}

function SectionNav({ items }: { items: readonly SectionNavItem[] }) {
  return <nav aria-label="栏目导航" className="section-nav"><ul className="sub-nav">{items.map((item) => <li key={item.href ?? item.label} className={item.current ? "current-menu-item" : undefined}>{item.disabled || !item.href ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : <Link href={item.href} className="nav-link" {...(item.current ? { "aria-current": "page" as const } : {})}>{item.label}</Link>}</li>)}</ul></nav>;
}
