"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { NavigationItem, SectionNavItem } from "@/lib/site";

export function MobileMenu({ currentPath = "", items, sectionItems = [] }: { currentPath?: string; items: readonly NavigationItem[]; sectionItems?: readonly SectionNavItem[] }) {
  const [open, setOpen] = useState(false);
  const summaryRef = useRef<HTMLElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  return <nav aria-label="主导航" className="mobile-menu"><details open={open} onToggle={(event) => { const nextOpen = event.currentTarget.open; setOpen(nextOpen); if (nextOpen) requestAnimationFrame(() => firstLinkRef.current?.focus()); }} onKeyDown={(event) => { if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); summaryRef.current?.focus(); } }}>
    <summary ref={summaryRef} aria-expanded={open} className="menu-summary">Menu</summary>
    <ul className="menu-links">{items.map((item, index) => <li key={item.label}>{item.disabled ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : <Link ref={index === 0 ? firstLinkRef : undefined} href={item.href} className="nav-link" {...(currentPath.startsWith(item.href) ? { "aria-current": "page" as const } : {})} onClick={() => setOpen(false)}>{item.label}</Link>}</li>)}</ul>
    {sectionItems.length > 0 && <ul className="menu-links menu-section-links" aria-label="栏目导航">{sectionItems.map((item) => <li key={item.href ?? item.label}>{item.disabled || !item.href ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : <Link href={item.href} className="nav-link" {...(item.current ? { "aria-current": "page" as const } : {})} onClick={() => setOpen(false)}>{item.label}</Link>}</li>)}</ul>}
  </details></nav>;
}
