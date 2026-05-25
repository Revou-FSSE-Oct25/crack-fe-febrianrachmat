import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FetchTimeoutError,
  friendlyFetchError,
  isRetryableFetchError,
} from "./fetch-reliable";

describe("fetch-reliable helpers", () => {
  it("friendlyFetchError maps timeout and network errors", () => {
    const timeout = friendlyFetchError(new FetchTimeoutError());
    assert.ok(timeout.includes("NEXT_PUBLIC_API_URL"));
    const net = friendlyFetchError(new TypeError("Failed to fetch"));
    assert.ok(net.includes("Tidak dapat terhubung"));
  });

  it("isRetryableFetchError flags timeout and TypeError", () => {
    assert.equal(isRetryableFetchError(new FetchTimeoutError()), true);
    assert.equal(isRetryableFetchError(new TypeError("x")), true);
    assert.equal(isRetryableFetchError(new Error("bad request")), false);
  });
});
