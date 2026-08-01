"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavigationItem, SectionNavItem } from "@/lib/site";

export function MobileMenu({ currentPath = "", items, sectionItems = [] }: { currentPath?: string; items: readonly NavigationItem[]; sectionItems?: readonly SectionNavItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => firstLinkRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const isCurrent = (href: string) => {
    const current = currentPath.replace(/\/+$/, "") || "/";
    const destination = href.replace(/\/+$/, "") || "/";
    return current === destination || (destination !== "/" && current.startsWith(`${destination}/`));
  };
  const renderItem = (item: NavigationItem, index: number) => <li key={item.label}>{item.disabled ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : item.external ? <a href={item.href} className="nav-link" target="_blank" rel="noreferrer" onClick={close}>{item.label}</a> : <Link ref={index === 0 ? firstLinkRef : undefined} href={item.href} className="nav-link" {...(isCurrent(item.href) ? { "aria-current": "page" as const } : {})} onClick={close}>{item.label}</Link>}</li>;
  return <nav aria-label="主导航" className="mobile-menu">
    <button ref={triggerRef} type="button" aria-expanded={open} aria-controls="mobile-navigation" className="menu-trigger" onClick={() => setOpen(true)}>{open ? "Close" : "Menu"}</button>
    {open && <div id="mobile-navigation" className="mobile-overlay">
      <div className="mobile-overlay-top"><Link href="/" className="site-identity" onClick={close}>Fio</Link><button type="button" className="menu-close" onClick={close}>Close</button></div>
      <nav aria-label="移动主导航"><ul className="mobile-nav">{items.map(renderItem)}</ul>
        {sectionItems.length > 0 && <ul className="mobile-sub" aria-label="栏目导航">{sectionItems.map((item) => <li key={item.href ?? item.label}>{item.disabled || !item.href ? <span className="nav-link nav-placeholder" aria-disabled="true">{item.label}</span> : <Link href={item.href} className="nav-link" {...(item.current ? { "aria-current": "page" as const } : {})} onClick={close}>{item.label}</Link>}</li>)}</ul>}
      </nav>
    </div>}
  </nav>;
}
