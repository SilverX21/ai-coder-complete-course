"use client";

import { useEffect, useRef, useState } from "react";
import { Bubble, Close } from "./icons";

type Message = { id: string; role: "user" | "assistant"; content: string };
type StreamEvent =
  | { type: "delta" | "replace"; text: string }
  | { type: "checking" }
  | { type: "done"; reply: string; token: string }
  | { type: "error"; error: string };

const first = (process.env.NEXT_PUBLIC_NAME ?? "").split(" ")[0];

const opener = `Hi! I'm ${first}'s digital twin — ask me anything about his career.`;

const RETRY_DELAY_MS = 3000;
const FALLBACK_ERROR = "Something went wrong. Try again.";

// Stable React keys. A counter, not crypto.randomUUID, which needs HTTPS outside localhost.
let nextId = 0;
const newId = () => String(nextId++);

function post(messages: Message[], token: string | null): Promise<Response> {
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })), token }),
  });
}

// Non-JSON bodies (a proxy's HTML error page, a platform timeout) become an empty object.
async function errorOf(res: Response): Promise<{ error: string; retryable: boolean }> {
  const data: { error?: unknown; retryable?: unknown } = await res.json().catch(() => ({}));
  return { error: typeof data.error === "string" ? data.error : FALLBACK_ERROR, retryable: data.retryable === true };
}

// The reply streams as one JSON event per line. A reader loop rather than for-await, which older
// Safari versions don't support on ReadableStream.
async function* events(body: ReadableStream<Uint8Array>): AsyncGenerator<StreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        yield JSON.parse(line) as StreamEvent;
      } catch {
        // A malformed line is skipped; only "done" makes the reply final.
      }
    }
  }
}

export function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  // Server signature over the transcript so far; sent back so earlier turns can't be forged.
  const tokenRef = useRef<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Focus the input on open; give focus back to the toggle on close.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const history = [...messages, { id: newId(), role: "user" as const, content: text }];
    const replyId = newId();
    setMessages(history);
    setInput("");
    setBusy(true);
    setError(null);

    // Creates the reply bubble on the first text, then keeps it in sync with the stream.
    const showReply = (update: (content: string) => string) =>
      setMessages((m) =>
        m.some((msg) => msg.id === replyId)
          ? m.map((msg) => (msg.id === replyId ? { ...msg, content: update(msg.content) } : msg))
          : [...m, { id: replyId, role: "assistant", content: update("") }]
      );

    try {
      let res = await post(history, tokenRef.current);
      // Free models are often busy for a few seconds: try once more before giving up.
      if (res.status === 503 && (await errorOf(res.clone())).retryable) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        res = await post(history, tokenRef.current);
      }
      if (!res.ok || !res.body || !res.headers.get("content-type")?.includes("ndjson")) {
        throw new Error((await errorOf(res)).error);
      }

      let finished = false;
      for await (const event of events(res.body)) {
        if (event.type === "delta") showReply((c) => c + event.text);
        else if (event.type === "replace") showReply(() => event.text);
        else if (event.type === "checking") setChecking(true);
        else if (event.type === "error") throw new Error(event.error);
        else if (event.type === "done") {
          tokenRef.current = event.token;
          showReply(() => event.reply);
          finished = true;
        }
      }
      if (!finished) throw new Error("The answer was cut off. Try again.");
    } catch (err) {
      // Drop the unanswered question (and any partial reply) so the transcript stays in sync
      // with the signed one.
      setMessages((m) => m.filter((msg) => msg.id !== replyId).slice(0, -1));
      setInput(text);
      setError(err instanceof TypeError ? "Can't reach the twin. Check your connection." : (err as Error).message);
    } finally {
      setBusy(false);
      setChecking(false);
    }
  }

  const waiting = busy && messages[messages.length - 1]?.role === "user";

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={open ? "twin-btn twin-btn-open" : "twin-btn"}
        aria-expanded={open}
        aria-controls="twin-panel"
        aria-label={open ? "Close the digital twin" : `Chat with ${first}'s digital twin`}
        onClick={() => setOpen(!open)}
      >
        <span className="twin-ping" aria-hidden="true" />
        {open ? <Close /> : <Bubble />}
        <span className="twin-label">
          <span>{open ? "Close" : "Ask my twin"}</span>
        </span>
      </button>

      <div
        id="twin-panel"
        role="dialog"
        aria-modal="false"
        className={open ? "twin-panel twin-panel-open" : "twin-panel"}
        aria-label={`Chat with ${first}'s digital twin`}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <div className="twin-head">
          <span className="live" aria-hidden="true" />
          Digital twin
          <button type="button" className="twin-min" aria-label="Minimize the digital twin" onClick={() => setOpen(false)}>
            <Close />
          </button>
        </div>
        {/* aria-busy: screen readers wait for the whole answer instead of reading every streamed word */}
        <div className="twin-log" ref={logRef} role="log" aria-live="polite" aria-busy={busy}>
          {messages.length === 0 && <p className="twin-msg twin-msg-bot">{opener}</p>}
          {messages.map((m) => (
            <p key={m.id} className={m.role === "user" ? "twin-msg twin-msg-user" : "twin-msg twin-msg-bot"}>
              {m.content}
            </p>
          ))}
          {waiting && <p className="twin-msg twin-msg-bot twin-typing">Thinking…</p>}
          {checking && <p className="twin-status">Double-checking the answer…</p>}
          {error && (
            <p className="twin-msg twin-msg-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <form
          className="twin-form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about my career…"
            aria-label="Your question"
            aria-describedby="twin-note"
            maxLength={2000}
          />
          <button type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
        <p id="twin-note" className="twin-note">
          Answers are AI-generated and may be wrong. Messages are processed by third-party AI providers (via
          OpenRouter), so please don&apos;t share personal data.
        </p>
      </div>
    </>
  );
}
