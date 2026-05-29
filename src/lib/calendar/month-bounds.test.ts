import { describe, expect, it } from "vitest";
import { monthBoundsIso, shiftMonth } from "./month-bounds";

describe("month-bounds", () => {
  it("monthBoundsIso covers full month", () => {
    const { from, to } = monthBoundsIso(2099, 6);
    expect(new Date(from).getMonth()).toBe(5);
    expect(new Date(to).getMonth()).toBe(5);
    expect(new Date(to).getDate()).toBe(30);
  });

  it("shiftMonth moves across year boundary", () => {
    expect(shiftMonth(2099, 1, -1)).toEqual({ year: 2098, month: 12 });
  });
});
