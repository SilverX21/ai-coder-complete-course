import { createHmac, timingSafeEqual } from "node:crypto";

// Pure helpers behind /api/chat, kept apart from the route so they can be unit-tested.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const MAX_MESSAGES = 24;
export const MAX_MESSAGE_CHARS = 2000;
export const MAX_BODY_BYTES = 64_000;
export const MAX_REPLY_CHARS = 2500;
export const TOKEN_TTL_MS = 60 * 60 * 1000;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

// Turns must alternate user/assistant and end on a user question. Every message is rebuilt
// so no extra fields (name, tool_calls, ...) reach the model API. Returns null when invalid.
export function parseConversation(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES || input.length % 2 === 0) {
    return null;
  }
  const history: ChatMessage[] = [];
  for (const [i, m] of input.entries()) {
    if (typeof m !== "object" || m === null) return null;
    const { role, content } = m as Record<string, unknown>;
    const expected = i % 2 === 0 ? "user" : "assistant";
    const max = expected === "user" ? MAX_MESSAGE_CHARS : MAX_REPLY_CHARS;
    if (role !== expected || typeof content !== "string" || content.length === 0 || content.length > max) return null;
    history.push({ role: expected, content });
  }
  return history;
}

// NFKC folds look-alike characters; control, zero-width and bidi characters can hide text from readers.
export function clean(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g, "")
    .trim();
}

// History lives on the client, so every reply comes with a token: issued-at time plus an HMAC over
// that time and the transcript. Forged or edited turns fail the check, and old tokens expire.
export function createSigner(secret: string, ttlMs = TOKEN_TTL_MS) {
  const mac = (issuedAt: number, history: ChatMessage[]) =>
    createHmac("sha256", secret).update(`${issuedAt}.${JSON.stringify(history)}`).digest("base64url");

  return {
    sign(history: ChatMessage[], now = Date.now()): string {
      return `${now}.${mac(now, history)}`;
    },
    verify(history: ChatMessage[], token: unknown, now = Date.now()): boolean {
      if (typeof token !== "string") return false;
      const [time, given, extra] = token.split(".");
      const issuedAt = Number(time);
      if (extra !== undefined || !given || !Number.isSafeInteger(issuedAt)) return false;
      if (issuedAt > now + MINUTE || now - issuedAt > ttlMs) return false;
      const expected = Buffer.from(mac(issuedAt, history));
      const actual = Buffer.from(given);
      return expected.length === actual.length && timingSafeEqual(expected, actual);
    },
  };
}

// Best effort: memory is per instance, so on serverless each instance counts on its own.
// The global cap keeps the shared OpenRouter quota alive even when many IPs (or spoofed
// x-forwarded-for values) hit the route. Put a platform rate limit in front for a hard guarantee.
export function createRateLimiter(limits: { perMinute: number; perDay: number; globalPerDay: number }) {
  const hits = new Map<string, number[]>();
  let global: number[] = [];

  return function limited(ip: string, now = Date.now()): "ip" | "global" | null {
    global = global.filter((t) => now - t < DAY);
    if (global.length >= limits.globalPerDay) return "global";

    const recent = (hits.get(ip) ?? []).filter((t) => now - t < DAY);
    const lastMinute = recent.filter((t) => now - t < MINUTE).length;
    if (lastMinute >= limits.perMinute || recent.length >= limits.perDay) {
      hits.set(ip, recent);
      return "ip";
    }
    recent.push(now);
    hits.set(ip, recent);
    global.push(now);
    if (hits.size > 10_000) {
      for (const [key, times] of hits) if (times.every((t) => now - t >= DAY)) hits.delete(key);
    }
    return null;
  };
}

// Some reasoning models fold their thinking into content inside <think> tags: drop the thinking,
// not just the tags, because it can quote the instructions.
export function stripThinking(content: string): string {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^[\s\S]*<\/think>/i, "")
    .replace(/<think>[\s\S]*$/i, "")
    .replace(/\*\*/g, "")
    .trim();
}

const words = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

// Flags a reply that contains the canary (plain, without dashes, or base64) or any run of
// `run` consecutive words from the secret text (the rules, not the public resume).
export function createLeakDetector(secretText: string, canary: string, run = 8) {
  const shingles = new Set<string>();
  const secretWords = words(secretText);
  for (let i = 0; i + run <= secretWords.length; i++) shingles.add(secretWords.slice(i, i + run).join(" "));
  const canaryForms = [canary, canary.replace(/-/g, ""), Buffer.from(canary).toString("base64")].map((c) =>
    c.toLowerCase()
  );

  return function leaks(reply: string): boolean {
    const lower = reply.toLowerCase();
    if (canaryForms.some((c) => lower.includes(c) || lower.replace(/[\s-]/g, "").includes(c.replace(/-/g, "")))) {
      return true;
    }
    const replyWords = words(reply);
    for (let i = 0; i + run <= replyWords.length; i++) {
      if (shingles.has(replyWords.slice(i, i + run).join(" "))) return true;
    }
    return false;
  };
}
