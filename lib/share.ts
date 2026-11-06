import type { Metadata } from "next";
import { SITE_NAME } from "./site-constants";

/** Site-wide share card (public/og-default.png), used when a page has no image of its own. */
export const DEFAULT_SHARE_IMAGE = { url: "/og-default.png", width: 1200, height: 630, alt: SITE_NAME };

interface ShareInput {
  /** Canonical path of the page, e.g. "/information/hello/". */
  url: string;
  /** A /media/... image; without one DEFAULT_SHARE_IMAGE is used. */
  image?: string;
  imageAlt?: string;
  /** Marks the page as og:type=article with its dates (YYYY-MM-DD). */
  article?: { published: string; updated?: string; tags?: string[] };
}

/**
 * Open Graph for one page. A page that sets openGraph replaces the root layout's object as a
 * whole (siteName and images included), so both are repeated here; title and description fall
 * back to the page metadata.
 */
export function shareMetadata({ url, image, imageAlt, article }: ShareInput): Pick<Metadata, "openGraph"> {
  const images = [image ? { url: image, alt: imageAlt ?? "" } : DEFAULT_SHARE_IMAGE];
  return {
    openGraph: article
      ? { siteName: SITE_NAME, url, type: "article", publishedTime: article.published, modifiedTime: article.updated, tags: article.tags, images }
      : { siteName: SITE_NAME, url, type: "website", images },
  };
}
