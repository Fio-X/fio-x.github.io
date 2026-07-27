"use client";

import { useEffect, useRef } from "react";
import { SITE_NAME } from "@/lib/site";

export function SiteFooter({ home = false }: { home?: boolean }) {
  const backToTopRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const updateVisibility = () => {
      const link = backToTopRef.current;
      if (!link) return;
      link.dataset.enhanced = "true";
      link.toggleAttribute("data-visible", window.scrollY > 500);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <footer className={`site-footer${home ? " site-footer-home" : ""}`}>
      <p>&copy; 2026 {SITE_NAME}</p>
      <a href="#top" ref={backToTopRef} className="back-to-top" aria-label="返回页面顶部">
        <span aria-hidden="true">↑</span>
      </a>
    </footer>
  );
}
