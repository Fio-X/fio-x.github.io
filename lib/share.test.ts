import { describe, expect, test } from "bun:test";
import { DEFAULT_SHARE_IMAGE, shareMetadata } from "./share";

describe("shareMetadata", () => {
  test("articles are og:type article with dates, tags and their cover", () => {
    expect(shareMetadata({ url: "/information/a/", image: "/media/a.jpg", article: { published: "2026-11-01", updated: "2026-11-05", tags: ["notes"] } }).openGraph).toEqual({
      siteName: "Fio", url: "/information/a/", type: "article", publishedTime: "2026-11-01", modifiedTime: "2026-11-05", tags: ["notes"], images: [{ url: "/media/a.jpg", alt: "" }],
    });
  });

  test("pages without an image keep the site-wide share card", () => {
    expect(shareMetadata({ url: "/works/w/" }).openGraph).toEqual({ siteName: "Fio", url: "/works/w/", type: "website", images: [DEFAULT_SHARE_IMAGE] });
  });
});
