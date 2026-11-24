import { describe, expect, it } from "vitest";
import { openRouterChunks, responseUnsafe, visibleSoFar, type StreamChunk } from "./stream";

function body(parts: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const p of parts) controller.enqueue(encoder.encode(p));
      controller.close();
    },
  });
}

async function collect(parts: string[]): Promise<StreamChunk[]> {
  const out: StreamChunk[] = [];
  for await (const chunk of openRouterChunks(body(parts))) out.push(chunk);
  return out;
}

const delta = (text: string) => `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`;

describe("openRouterChunks", () => {
  it("yields text deltas, skipping comments and stopping at [DONE]", async () => {
    const chunks = await collect([": OPENROUTER PROCESSING\n\n", delta("I work"), delta(" with SQL."), "data: [DONE]\n\n", delta("late")]);
    expect(chunks).toEqual([{ text: "I work" }, { text: " with SQL." }]);
  });

  it("joins lines split across network chunks", async () => {
    const line = delta("PostgreSQL");
    expect(await collect([line.slice(0, 12), line.slice(12)])).toEqual([{ text: "PostgreSQL" }]);
  });

  it("reports a mid-stream error", async () => {
    const error = `data: ${JSON.stringify({ error: { message: "rate-limited", code: 429 } })}\n\n`;
    expect(await collect([delta("Hi"), error])).toEqual([{ text: "Hi" }, { error: "rate-limited", code: 429 }]);
  });
});

describe("visibleSoFar", () => {
  it("hides an unfinished thinking block", () => {
    expect(visibleSoFar("<think>my rules say")).toBe("");
    expect(visibleSoFar("<think>my rules</think>I use SQL")).toBe("I use SQL");
  });

  it("holds back a tail that could become a tag", () => {
    expect(visibleSoFar("Answer <thi")).toBe("Answer ");
    expect(visibleSoFar("Answer </th")).toBe("Answer ");
  });

  it("drops reasoning before a stray closing tag", () => {
    expect(visibleSoFar("leaked reasoning</think>Answer")).toBe("Answer");
  });

  it("removes bold markers and holds back a lone asterisk", () => {
    expect(visibleSoFar("I use **PostgreSQL")).toBe("I use PostgreSQL");
    expect(visibleSoFar("I use *")).toBe("I use ");
  });
});

describe("responseUnsafe", () => {
  it("reads the response verdict, not the user one", () => {
    expect(responseUnsafe("User Safety: unsafe\nResponse Safety: safe")).toBe(false);
    expect(responseUnsafe("User Safety: safe\nResponse Safety: unsafe\nSafety Categories: Harassment")).toBe(true);
  });
});
