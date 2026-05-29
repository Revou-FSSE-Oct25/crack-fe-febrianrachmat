import { describe, expect, it } from "vitest";
import { formatIdr, parseMoney } from "./currency";

describe("parseMoney", () => {
  it("parses numbers and numeric strings", () => {
    expect(parseMoney(150000)).toBe(150000);
    expect(parseMoney("250000")).toBe(250000);
  });

  it("returns 0 for empty or invalid values", () => {
    expect(parseMoney(null)).toBe(0);
    expect(parseMoney("")).toBe(0);
    expect(parseMoney("not-a-number")).toBe(0);
  });
});

describe("formatIdr", () => {
  it("formats valid amounts as IDR", () => {
    const formatted = formatIdr(150000);
    expect(formatted).toContain("150");
    expect(formatted).toMatch(/Rp|IDR/i);
  });

  it("returns em dash for empty values", () => {
    expect(formatIdr(null)).toBe("—");
    expect(formatIdr("")).toBe("—");
  });
});
