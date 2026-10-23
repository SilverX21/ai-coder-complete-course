"use client";

import { useEffect, useRef, useState } from "react";
import { Bubble, Close } from "./icons";

type Message = { id: string; role: "user" | "assistant"; content: string };
type Reply = { reply?: unknown; token?: unknown; error?: unknown; retryable?: unknown };

const first = (process.env.NEXT_PUBLIC_NAME ?? "").split(" ")[0];

const opener = `Hi! I'm ${first}'s digital twin — ask me anything about his career.`;

const RETRY_DELAY_MS = 3000;

// Stable React keys. A counter, not crypto.randomUUID, which needs HTTPS outside localhost.
let nextId = 0;
const newId = () => String(nextId++);

// Non-JSON bodies (a proxy's HTML error page, a platform timeout) become an empty object.
async function ask(messages: Message[], token: string | null): Promise<{ status: number; data: Reply }> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })), token }),
  });
  const data: Reply = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

export function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setMessages(history);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      let { status, data } = await ask(history, tokenRef.current);
      // Free models are often busy for a few seconds: try once more before giving up.
      if (status === 503 && data.retryable === true) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        ({ status, data } = await ask(history, tokenRef.current));
      }
      if (status !== 200 || typeof data.reply !== "string" || typeof data.token !== "string") {
        throw new Error(typeof data.error === "string" ? data.error : "Something went wrong. Try again.");
      }
      tokenRef.current = data.token;
      const reply = data.reply;
      setMessages((m) => [...m, { id: newId(), role: "assistant", content: reply }]);
    } catch (err) {
      // Drop the unanswered question so the transcript stays in sync with the signed one.
      setMessages((m) => m.slice(0, -1));
      setInput(text);
      setError(err instanceof TypeError ? "Can't reach the twin. Check your connection." : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

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
        <div className="twin-log" ref={logRef} role="log" aria-live="polite">
          {messages.length === 0 && <p className="twin-msg twin-msg-bot">{opener}</p>}
          {messages.map((m) => (
            <p key={m.id} className={m.role === "user" ? "twin-msg twin-msg-user" : "twin-msg twin-msg-bot"}>
              {m.content}
            </p>
          ))}
          {busy && <p className="twin-msg twin-msg-bot twin-typing">Thinking…</p>}
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
