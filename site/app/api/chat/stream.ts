// Streaming helpers for /api/chat: read OpenRouter's server-sent events and decide how much of the
// reply is safe to show so far.

export type StreamChunk = { text: string } | { error: string; code?: number };

// OpenRouter streams `data: {json}` lines, `: comment` keep-alives and a final `data: [DONE]`.
export async function* openRouterChunks(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamChunk> {
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const bytes of body) {
    buffer += decoder.decode(bytes, { stream: true });
    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      let event;
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }
      if (event.error) {
        yield { error: String(event.error.message ?? "stream error"), code: Number(event.error.code) || undefined };
        return;
      }
      const text = event.choices?.[0]?.delta?.content;
      if (typeof text === "string" && text) yield { text };
    }
  }
}

const THINK_OPEN = "<think>";
const THINK_CLOSE = "</think>";

// Length of the longest tail of `text` that could still grow into `tag`, e.g. "<thi" for "<think>".
function partialTag(text: string, tag: string): number {
  const lower = text.toLowerCase();
  for (let n = Math.min(tag.length - 1, lower.length); n > 0; n--) {
    if (tag.startsWith(lower.slice(-n))) return n;
  }
  return 0;
}

// What may be shown of a reply that is still arriving: same rules as stripThinking, but an open
// <think> hides everything after it, and a tail that might become a tag or "**" is held back.
export function visibleSoFar(raw: string): string {
  let text = raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^[\s\S]*<\/think>/i, "")
    .replace(/<think>[\s\S]*$/i, "");
  const held = Math.max(partialTag(text, THINK_OPEN), partialTag(text, THINK_CLOSE));
  if (held) text = text.slice(0, -held);
  text = text.replace(/\*\*/g, "");
  if (text.endsWith("*")) text = text.slice(0, -1);
  return text.trimStart();
}

// Nemotron Content Safety answers in plain text, e.g. "User Safety: safe\nResponse Safety: unsafe".
export function responseUnsafe(verdict: string): boolean {
  return /response safety:\s*unsafe/i.test(verdict);
}
