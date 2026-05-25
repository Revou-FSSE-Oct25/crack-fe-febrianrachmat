import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapStreamPayload, parseSseBuffer } from "./chat-sse";

describe("chat-sse", () => {
  it("parseSseBuffer splits events", () => {
    const raw =
      'data: {"id":"1","content":"hi","createdAt":"2026-05-25T00:00:00.000Z","sender":{"id":"u","fullName":"A"}}\n\n' +
      "event: ping\ndata: \n\n";
    const { events, rest } = parseSseBuffer(raw);
    assert.equal(events.length, 2);
    assert.equal(events[0]?.data?.includes('"id":"1"'), true);
    assert.equal(events[1]?.event, "ping");
    assert.equal(rest, "");
  });

  it("mapStreamPayload maps message JSON", () => {
    const msg = mapStreamPayload(
      JSON.stringify({
        id: "m1",
        content: "test",
        createdAt: "2026-05-25T10:00:00.000Z",
        sender: { id: "u1", fullName: "Pat" },
      }),
    );
    assert.equal(msg?.id, "m1");
    assert.equal(msg?.sender.fullName, "Pat");
  });
});
