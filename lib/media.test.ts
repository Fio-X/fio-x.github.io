import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mediaDimensions } from "./media";

const originalCwd = process.cwd();
const temporaryDirectories: string[] = [];

afterEach(() => {
  process.chdir(originalCwd);
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function withMedia(files: Record<string, Uint8Array>) {
  const directory = mkdtempSync(join(tmpdir(), "portfolio-blog-media-"));
  temporaryDirectories.push(directory);
  mkdirSync(join(directory, "public/media"), { recursive: true });
  for (const [name, bytes] of Object.entries(files)) writeFileSync(join(directory, "public/media", name), bytes);
  process.chdir(directory);
}

const u16 = (value: number) => [value >> 8, value & 0xff];
const u32 = (value: number) => [...u16(value >>> 16), ...u16(value & 0xffff)];

/** PNG signature + IHDR chunk: enough for a size reader. */
export function pngBytes(width: number, height: number) {
  const ihdr = [...u32(width), ...u32(height), 8, 2, 0, 0, 0];
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...u32(13), 0x49, 0x48, 0x44, 0x52, ...ihdr, 0, 0, 0, 0]);
}

/** JPEG with an optional EXIF Orientation tag (APP1) and a baseline SOF0 frame header. */
export function jpegBytes(width: number, height: number, orientation?: number) {
  const app1: number[] = [];
  if (orientation !== undefined) {
    const tiff = [0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x12, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, orientation, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
    const payload = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00, ...tiff];
    app1.push(0xff, 0xe1, ...u16(payload.length + 2), ...payload);
  }
  // Real JPEGs start with a JFIF APP0 segment after SOI; size readers rely on that layout.
  const app0 = [0xff, 0xe0, ...u16(16), 0x4a, 0x46, 0x49, 0x46, 0x00, 1, 1, 0, ...u16(1), ...u16(1), 0, 0];
  const sof0 = [0xff, 0xc0, ...u16(17), 8, ...u16(height), ...u16(width), 3, 1, 0x11, 0, 2, 0x11, 1, 3, 0x11, 1];
  return new Uint8Array([0xff, 0xd8, ...app0, ...app1, ...sof0, 0xff, 0xd9]);
}

describe("mediaDimensions", () => {
  test("reads the intrinsic size of local media", () => {
    withMedia({ "wide.png": pngBytes(40, 20), "plain.jpg": jpegBytes(30, 10) });
    expect(mediaDimensions("/media/wide.png")).toEqual({ width: 40, height: 20 });
    expect(mediaDimensions("/media/plain.jpg")).toEqual({ width: 30, height: 10 });
  });

  test("swaps width and height for EXIF orientations that rotate by 90 degrees", () => {
    withMedia({ "rotated.jpg": jpegBytes(40, 20, 6), "upright.jpg": jpegBytes(40, 20, 1) });
    expect(mediaDimensions("/media/rotated.jpg")).toEqual({ width: 20, height: 40 });
    expect(mediaDimensions("/media/upright.jpg")).toEqual({ width: 40, height: 20 });
  });

  test("returns undefined for missing files, non-media paths and path traversal", () => {
    withMedia({});
    expect(mediaDimensions("/media/missing.png")).toBeUndefined();
    expect(mediaDimensions("https://example.com/a.png")).toBeUndefined();
    expect(mediaDimensions("/media/../package.json")).toBeUndefined();
    expect(mediaDimensions(undefined)).toBeUndefined();
  });
});
