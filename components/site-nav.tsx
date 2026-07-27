import Link from "next/link";
import type { NavigationItem } from "@/lib/site";

export function SiteNav({ currentPath = "", items }: { currentPath?: string; items: readonly NavigationItem[] }) {
  return (
    <nav aria-label="主导航" className="primary-nav">
      <ul>{items.map((item) => <li key={item.label}>
        {item.disabled ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : <Link href={item.href} className="nav-link" {...(currentPath.startsWith(item.href) ? { "aria-current": "page" as const } : {})}>{item.label}</Link>}
      </li>)}</ul>
    </nav>
  );
}
