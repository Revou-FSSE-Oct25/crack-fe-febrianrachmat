import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseTherapistBrowseParams,
  serializeTherapistBrowseParams,
} from "./browse-params";

describe("therapist browse URL params", () => {
  it("round-trips filters through URLSearchParams", () => {
    const serialized = serializeTherapistBrowseParams({
      search: "lutut",
      categoryId: "cat-1",
      onlineOnly: true,
      sort: "rating_desc",
      minRating: 4,
      page: 2,
    });
    const parsed = parseTherapistBrowseParams(new URLSearchParams(serialized));
    assert.equal(parsed.search, "lutut");
    assert.equal(parsed.categoryId, "cat-1");
    assert.equal(parsed.onlineOnly, true);
    assert.equal(parsed.sort, "rating_desc");
    assert.equal(parsed.minRating, 4);
    assert.equal(parsed.page, 2);
  });

  it("falls back to defaults for invalid sort and page", () => {
    const parsed = parseTherapistBrowseParams(
      new URLSearchParams("sort=invalid&page=0&minRating=9"),
    );
    assert.equal(parsed.sort, "newest");
    assert.equal(parsed.page, 1);
    assert.equal(parsed.minRating, null);
  });
});
