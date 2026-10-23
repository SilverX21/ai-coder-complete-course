"use client";

import { useEffect, useRef, useState } from "react";
import { Bubble, Close } from "./icons";

type Message = { role: "user" | "assistant"; content: string };

const first = (process.env.NEXT_PUBLIC_NAME ?? "").split(" ")[0];

const opener: Message = {
  role: "assistant",
  content: `Hi! I'm ${first}'s digital twin — ask me anything about his career.`,
};

export function Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Server signature over the transcript so far; sent back so earlier turns can't be forged.
  const tokenRef = useRef<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const history = [...messages, { role: "user", content: text } as Message];
    setMessages(history);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, token: tokenRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      tokenRef.current = data.token;
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      // Drop the unanswered question so the transcript stays in sync with the signed one.
      setMessages((m) => m.slice(0, -1));
      setInput(text);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
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

      <div id="twin-panel" className={open ? "twin-panel twin-panel-open" : "twin-panel"} aria-label={`Chat with ${first}'s digital twin`}>
        <div className="twin-head">
          <span className="live" aria-hidden="true" />
          Digital twin
          <button type="button" className="twin-min" aria-label="Minimize the digital twin" onClick={() => setOpen(false)}>
            <Close />
          </button>
        </div>
        <div className="twin-log" ref={logRef} role="log" aria-live="polite">
          {messages.length === 0 && <p className="twin-msg twin-msg-bot">{opener.content}</p>}
          {messages.map((m, i) => (
            <p key={i} className={m.role === "user" ? "twin-msg twin-msg-user" : "twin-msg twin-msg-bot"}>
              {m.content}
            </p>
          ))}
          {busy && <p className="twin-msg twin-msg-bot twin-typing">Thinking…</p>}
          {error && <p className="twin-msg twin-msg-error">{error}</p>}
        </div>
        <form
          className="twin-form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about my career…"
            aria-label="Your question"
            maxLength={2000}
          />
          <button type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </>
  );
}
