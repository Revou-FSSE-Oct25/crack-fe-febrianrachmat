import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { monthBoundsIso, shiftMonth } from "./month-bounds";

describe("month-bounds", () => {
  it("monthBoundsIso covers full month", () => {
    const { from, to } = monthBoundsIso(2099, 6);
    assert.equal(new Date(from).getMonth(), 5);
    assert.equal(new Date(to).getMonth(), 5);
    assert.equal(new Date(to).getDate(), 30);
  });

  it("shiftMonth moves across year boundary", () => {
    assert.deepEqual(shiftMonth(2099, 1, -1), { year: 2098, month: 12 });
  });
});
