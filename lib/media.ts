import { readFileSync } from "node:fs";
import { join } from "node:path";
import { imageSize } from "image-size";

export interface MediaDimensions {
  width: number;
  height: number;
}

/**
 * Intrinsic size of a public /media/... image, read at build time so <img> can carry width/height
 * and the browser reserves the right space before the file loads (no layout shift).
 * EXIF orientations 5–8 rotate the picture by 90°; browsers apply them, so width and height swap.
 */
export function mediaDimensions(src: string | undefined): MediaDimensions | undefined {
  if (!src?.startsWith("/media/") || src.includes("..")) return undefined;
  try {
    const { width, height, orientation } = imageSize(readFileSync(join(process.cwd(), "public", src)));
    if (!width || !height) return undefined;
    return orientation !== undefined && orientation >= 5 ? { width: height, height: width } : { width, height };
  } catch {
    return undefined;
  }
}
