import { describe, expect, it } from "vitest";
import {
  FetchTimeoutError,
  friendlyFetchError,
  isRetryableFetchError,
} from "./fetch-reliable";

describe("fetch-reliable helpers", () => {
  it("friendlyFetchError maps timeout and network errors", () => {
    const timeout = friendlyFetchError(new FetchTimeoutError());
    expect(timeout).toContain("NEXT_PUBLIC_API_URL");
    const net = friendlyFetchError(new TypeError("Failed to fetch"));
    expect(net).toContain("Tidak dapat terhubung");
  });

  it("isRetryableFetchError flags timeout and TypeError", () => {
    expect(isRetryableFetchError(new FetchTimeoutError())).toBe(true);
    expect(isRetryableFetchError(new TypeError("x"))).toBe(true);
    expect(isRetryableFetchError(new Error("bad request"))).toBe(false);
  });
});
