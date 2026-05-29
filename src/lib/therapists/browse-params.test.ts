import { describe, expect, it } from "vitest";
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
    expect(parsed.search).toBe("lutut");
    expect(parsed.categoryId).toBe("cat-1");
    expect(parsed.onlineOnly).toBe(true);
    expect(parsed.sort).toBe("rating_desc");
    expect(parsed.minRating).toBe(4);
    expect(parsed.page).toBe(2);
  });

  it("falls back to defaults for invalid sort and page", () => {
    const parsed = parseTherapistBrowseParams(
      new URLSearchParams("sort=invalid&page=0&minRating=9"),
    );
    expect(parsed.sort).toBe("newest");
    expect(parsed.page).toBe(1);
    expect(parsed.minRating).toBe(null);
  });
});
