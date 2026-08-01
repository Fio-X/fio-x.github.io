import Link from "next/link";
import type { NavigationItem } from "@/lib/site";

export function SiteNav({ currentPath = "", items }: { currentPath?: string; items: readonly NavigationItem[] }) {
  return (
    <nav aria-label="主导航" className="primary-nav">
      <ul>{items.map((item) => {
        const current = !item.disabled && !item.external && isCurrent(currentPath, item.href);
        return <li key={item.label} className={current ? "current-menu-item" : undefined}>
          {item.disabled ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : item.external ? <a href={item.href} className="nav-link" target="_blank" rel="noreferrer">{item.label}</a> : <Link href={item.href} className="nav-link" {...(current ? { "aria-current": "page" as const } : {})}>{item.label}</Link>}
        </li>;
      })}</ul>
    </nav>
  );
}

function isCurrent(currentPath: string, href: string) {
  const current = currentPath.replace(/\/+$/, "") || "/";
  const destination = href.replace(/\/+$/, "") || "/";
  return current === destination || (destination !== "/" && current.startsWith(`${destination}/`));
}
