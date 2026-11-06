import { afterEach, describe, expect, test } from "bun:test";
import { localIsoDate } from "./dates";

// Restore by assignment: in Bun, deleting process.env.TZ stops later TZ changes from taking effect.
const originalTimeZone = process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

afterEach(() => {
  process.env.TZ = originalTimeZone;
});

describe("localIsoDate", () => {
  test("uses the local calendar day where UTC has already rolled over", () => {
    process.env.TZ = "America/New_York";
    const evening = new Date("2026-11-06T02:30:00Z"); // 21:30 on Nov 5 in New York
    expect(evening.toISOString().slice(0, 10)).toBe("2026-11-06");
    expect(localIsoDate(evening)).toBe("2026-11-05");
  });

  test("uses the local calendar day where UTC is still on the previous day", () => {
    process.env.TZ = "Asia/Shanghai";
    expect(localIsoDate(new Date("2026-11-05T20:00:00Z"))).toBe("2026-11-06");
  });

  test("pads single-digit months and days", () => {
    process.env.TZ = "UTC";
    expect(localIsoDate(new Date("2026-01-02T12:00:00Z"))).toBe("2026-01-02");
  });
});
