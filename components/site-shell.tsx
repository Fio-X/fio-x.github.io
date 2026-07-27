import Link from "next/link";
import type { ReactNode } from "react";
import { CONTENT_NAV_ITEMS, type SectionNavItem, SITE_NAME } from "@/lib/site";
import { MobileMenu } from "./mobile-menu";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { SkipLink } from "./skip-link";

export function SiteShell({ children, currentPath, layout = "reading", sectionItems = [] }: { children: ReactNode; currentPath?: string; layout?: "reading" | "work"; sectionItems?: readonly SectionNavItem[] }) {
  return <><SkipLink /><div className={`site-shell site-shell-${layout}`}><header className="site-header">
    <Link href="/" className="site-identity">{SITE_NAME}</Link>
    <div className="site-nav-standard"><div className="site-nav-primary"><SiteNav currentPath={currentPath} items={CONTENT_NAV_ITEMS} /></div>{sectionItems.length > 0 && <SectionNav items={sectionItems} />}</div>
    <MobileMenu currentPath={currentPath} items={CONTENT_NAV_ITEMS} sectionItems={sectionItems} />
  </header><main id="main-content" tabIndex={-1} className={layout === "work" ? "work-column" : "reading-column"}>{children}</main></div><SiteFooter /></>;
}

function SectionNav({ items }: { items: readonly SectionNavItem[] }) {
  return <nav aria-label="栏目导航" className="section-nav"><ul>{items.map((item) => <li key={item.href ?? item.label}>{item.disabled || !item.href ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : <Link href={item.href} className="nav-link" {...(item.current ? { "aria-current": "page" as const } : {})}>{item.label}</Link>}</li>)}</ul></nav>;
}
