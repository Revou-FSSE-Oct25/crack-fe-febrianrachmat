import { describe, expect, it } from "vitest";
import { mapStreamPayload, parseSseBuffer } from "./chat-sse";

describe("chat-sse", () => {
  it("parseSseBuffer splits events", () => {
    const raw =
      'data: {"id":"1","content":"hi","createdAt":"2026-05-25T00:00:00.000Z","sender":{"id":"u","fullName":"A"}}\n\n' +
      "event: ping\ndata: \n\n";
    const { events, rest } = parseSseBuffer(raw);
    expect(events).toHaveLength(2);
    expect(events[0]?.data).toContain('"id":"1"');
    expect(events[1]?.event).toBe("ping");
    expect(rest).toBe("");
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
    expect(msg?.id).toBe("m1");
    expect(msg?.sender.fullName).toBe("Pat");
  });
});
