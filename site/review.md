# Code Review: CV Site (`site/`)

**Date:** 2026-10-23
**Commit reviewed:** `ff186e0` ("udpate course section on cv website"), plus the untracked `tutorial.md`
**Scope:** everything in `site/`: `app/` (page, layout, chat, chat API route, floor plan, icons, CSS), configuration and dependencies. The other projects in this repository (`cursor_kanban/`, `instant/`) were **not** reviewed.
**No code was changed** during this review.

---

## Remediation status (2026-10-23)

All findings were addressed except M3 and L8, which were left as they are by choice (keep the current environment-variable setup; see below).

| Finding | Status | What changed |
|---|---|---|
| C1 Vulnerable Next.js | ✅ Fixed | `next` 16.3.0 → 16.4.2. `pnpm audit --prod`: no known vulnerabilities. One high advisory remains in `braces`, a dev-only dependency of `eslint-config-next` with no patched version; it only matters when linting untrusted glob patterns. |
| H1 Clean clone can't build | ✅ Fixed | `site/public/profile.png` removed from the root `.gitignore` (commit it). Verified: a copy with only committable files and no `.env` passes install, typecheck, lint, test and build. |
| H2 Rate limit | ⚠️ Partly fixed | New global daily cap (800 requests a day, below OpenRouter's 1000) that holds whatever IP is claimed. Still per instance and still trusts `x-forwarded-for`. **Once hosting is chosen**, add a platform rate limit (for example a Vercel Firewall rule on `/api/chat`) or Upstash. |
| M1 Security headers | ✅ Fixed | New `next.config.ts`: CSP (static-safe, no nonces), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. Verified with no CSP violations in the browser. |
| M2 Privacy notice | ✅ Fixed | A note under the chat input, linked to it with `aria-describedby`. |
| M3 Duplicated resume content | ⏸ Not done | Left as is with the current data setup. Remember to update the RESUME block in `route.ts` when `page.tsx` changes. |
| M4 Signing key and expiry | ✅ Fixed | `TWIN_SIGNING_SECRET` (added to `.env.local`; **also set it on the host**). It falls back to the old derived key with a warning. Tokens are `issuedAt.hmac` and expire after 1 hour. |
| M5 Model order | ✅ Fixed | `nemotron-3.5-super-vl` → `nemotron-3-ultra` → `dots-3-note-preview`. |
| M6 Non-JSON errors | ✅ Fixed | Safe JSON parsing, reply and token shape checks, a network error message, and one automatic retry after 3 seconds when the server says `retryable` (upstream 429 only, not the daily cap). |
| M7 Tests, lint, strict | ✅ Fixed | `strict: true`; ESLint flat config (`core-web-vitals` + `typescript`); `app/api/chat/guard.ts` holds the security logic with 17 Vitest tests in `guard.test.ts`; scripts `lint`, `typecheck` (`next typegen && tsc --noEmit`), `test`; CI in `.github/workflows/site.yml`. `pnpm-workspace.yaml` denies the `unrs-resolver` install script so `pnpm install --frozen-lockfile` works in CI. |
| L1 Leak detection | ✅ Improved | Catches the canary (plain, without dashes, base64) and any run of 8 consecutive words from the RULES block, ignoring case and punctuation. The public resume isn't checked, so normal answers pass. |
| L2 Footer year | ✅ Fixed | `app/year.tsx` (`useSyncExternalStore`: build year on the server, current year in the browser, no hydration mismatch). |
| L3 Keys | ✅ Fixed | Jobs keyed by `from-role`; chat messages get counter IDs. |
| L4 Dead links | ✅ Fixed | Profiles without a handle or URL are dropped; hero buttons render only when present. |
| L5 Name handling | ✅ Fixed | Everything after the first name is kept; initials are derived from `NEXT_PUBLIC_NAME`. |
| L6 Chat accessibility | ✅ Fixed | `role="dialog"` (non-modal), focus moves to the input on open and back to the toggle on close, `Escape` closes, errors use `role="alert"`. |
| L7 Turbopack root | ✅ Fixed | `turbopack.root` pinned in `next.config.ts`; the warning is gone. The stray `~/package.json` and `~/pnpm-lock.yaml` were left alone (outside this repo). |
| L8 Personal data in code | ⏸ Not done | Left as is by choice. |
| Extra: TypeScript | ✅ Updated | `typescript` ^5.9.3 → ^6.0.3, the latest 6.x (7.x exists but wasn't requested). Typecheck, lint, tests and build pass with no peer warnings. |
| Extra: streaming + guard model | ✅ Added | Replies stream as NDJSON events (`delta`, `replace`, `checking`, `done`, `error`) with a leak check on every chunk; `nvidia/nemotron-3.5-content-safety:free` reviews each final reply (10s timeout, fails open). Global cap lowered to 400 questions a day, because each question now costs 2 requests. 25 tests. |

---

## Summary

The site is small, readable and in good shape. The digital twin's API route is hardened against the common prompt-injection and abuse patterns. React escapes all text, the OpenRouter key stays on the server, and no secrets are in git.

Two things need action before the next deploy:

1. **`next@16.3.0` has 13 known vulnerabilities, 5 of them critical** (including unauthenticated remote code execution in the Image Optimization API, which this site uses). Upgrade to `16.4.2`.
2. **A clean clone cannot build.** `app/page.tsx` imports `public/profile.png`, which is git-ignored, so a Vercel or CI build from GitHub fails.

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 2 |
| Medium | 7 |
| Low | 8 |

### Checks run

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ passes |
| `npx tsc --noEmit --strict` | ✅ passes, 0 errors (strict mode can be enabled for free) |
| `npx next build` | ✅ passes; `/` is static, `/api/chat` is dynamic |
| `pnpm audit` | ❌ 13 advisories in `next` (1 low, 5 moderate, 2 high, 5 critical) |
| Secret in client bundle (`grep "sk-or-" .next/static`) | ✅ not found |
| Secrets / personal files in git history (`.env*`, CV PDF, `profile.png`) | ✅ never committed |
| Manual attack tests on `/api/chat` (forged history, tampering, injection, rate limit) | ✅ all blocked (see `tutorial.md` §8) |

---

## Critical

### C1. Vulnerable Next.js version (13 advisories, 5 critical)

**Where:** `package.json` (`"next": "16.3.0"`)

`pnpm audit` reports these, among others:

| Severity | Advisory | Issue | Fixed in |
|---|---|---|---|
| Critical | GHSA-2xp9-vwfh-vxw4 | Unauthenticated RCE in Image Optimization API (AVIF) | 16.3.3 |
| Critical | GHSA-2464-fhr4-w9xw | Unauthenticated RCE in Image Optimization API (SVG) | 16.4.1 |
| Critical | GHSA-p293-qw3h-jr36 | Unauthenticated RCE on Windows-hosted servers | 16.3.3 |
| Critical | GHSA-vcvr-r3jv-pc5j | RCE in `next/og` `ImageResponse` | 16.3.6 |
| Critical | GHSA-673q-mjm6-r5xr | RCE in `use cache` functions returning typed arrays | 16.4.1 |
| High | GHSA-cjq9-62q9-8jv4 | SSRF in Image Optimization | 16.3.8 |
| High | GHSA-p3m5-59mp-jv5r | DoS in App Router via Server Actions | 16.4.1 |
| Moderate / Low | 6 more | Cache poisoning, information disclosure | 16.3.8 |

**Why it matters here:** `app/page.tsx` uses `next/image`, so the `/_next/image` optimizer endpoint is live on the deployed site. The Image Optimization RCE and SSRF advisories therefore apply directly.

**Remedial action:**

```bash
cd site
pnpm add next@16.4.2
pnpm audit          # expect 0 advisories for next
pnpm run build
```

Read the Next.js 16.4 release notes and `node_modules/next/dist/docs/` for breaking changes before deploying. Then add a dependency check (Dependabot or `pnpm audit` in CI) so this doesn't happen silently again.

---

## High

### H1. Clean clone cannot build: `profile.png` is imported but git-ignored

**Where:** `app/page.tsx:2`, `.gitignore` (root, last two lines)

```ts
import portrait from "../public/profile.png";
```

```gitignore
# Personal site assets (kept local)
site/public/profile.png
```

A static `import` of a missing file is a build error. The build works on your machine only because the file exists locally. Any deploy that builds from GitHub (Vercel, CI) fails with a "module not found" error.

**Remedial action:** pick one of these:

- **Commit the image.** It is published on the live site anyway, so keeping it out of git adds little privacy.
- **Keep it out of git:** remove the static import, serve the picture from a URL set in an environment variable (for example `NEXT_PUBLIC_PORTRAIT_URL`, allowed via `images.remotePatterns`), and render nothing or a placeholder when it is missing.

### H2. Rate limit can be bypassed, and does not hold across server instances

**Where:** `app/api/chat/route.ts:84-103`, `:128`

```ts
const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
```

Two weaknesses:

- **Spoofable IP.** `x-forwarded-for` can be trusted only when a proxy you control overwrites it. Vercel does this. A self-hosted `next start` with no proxy in front does not, so an attacker can send a different fake IP on every request and never be limited.
- **Per-instance memory.** `hits` lives in one process's memory. On serverless hosting, each instance counts separately, and cold starts reset the count. The code comment already says this.

The OpenRouter key is shared by every visitor and limited to roughly 1000 free requests per day plus a per-minute cap. Bypassing the limit can therefore take the twin offline for everyone.

**Remedial action:**

1. Add a platform-level rate limit, such as Vercel Firewall rules on `/api/chat` or a WAF in front of a self-hosted server.
2. For an application-level limit that holds across instances, use a shared store such as Upstash Redis (`@upstash/ratelimit`).
3. Add a **global** daily cap (for example 800 requests per day) below the OpenRouter daily allowance. It protects the quota even against many different IPs.
4. When self-hosting, only trust `x-forwarded-for` behind a proxy that sets it.

---

## Medium

### M1. No HTTP security headers

**Where:** there is no `next.config.ts` in `site/`.

The site sends no `Content-Security-Policy`, `frame-ancestors` / `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options` or `Permissions-Policy`. That allows clickjacking (the site framed by another page), and there is no second line of defence if an XSS bug is ever introduced.

**Remedial action:** add `site/next.config.ts` with `headers()` (see `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md`), for example:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

Start with the CSP above and tighten it later (`script-src` with nonces) if needed. Test that the fonts and images still load.

### M2. No privacy notice for the chat (GDPR)

**Where:** `app/chat.tsx` (the panel UI) and `app/api/chat/route.ts:179`

Whatever visitors type is sent to OpenRouter and then to free-tier model providers (NVIDIA, Google AI Studio, etc.), which may log prompts or use them for training. The site is run from Portugal, so GDPR applies. Visitors are not told any of this.

**Remedial action:**

- Add a one-line notice under the chat input, such as *"Messages are processed by third-party AI providers. Don't share personal data."*, linking to a short privacy section.
- Prefer providers with no-training / zero-data-retention terms. OpenRouter has account-level privacy settings for this.

### M3. Resume content is duplicated in two places

**Where:** `app/page.tsx:37-129` (career, stack, certificates) and `app/api/chat/route.ts:52-63` (the RESUME block in the system prompt)

The same facts are written twice by hand. They will drift apart. For example, when a certificate is added to the page, the twin won't know about it unless the prompt is also edited. The prompt currently says "20+ certified courses" while the page counts them.

**Remedial action:** move the career data to one module (for example `app/resume.ts`) that exports typed data. Render the page from it, and build the prompt's RESUME block from it with a small function.

### M4. Signing key is derived from the API key, and tokens never expire

**Where:** `app/api/chat/route.ts:67-82`

```ts
const signingKey = createHmac("sha256", process.env.OPENROUTER_API_KEY ?? "")
  .update("digital-twin-history-v1")
  .digest();
```

- Rotating the OpenRouter key silently breaks every open conversation, and one secret does two unrelated jobs.
- A signed transcript stays valid forever, so a saved long conversation can be replayed indefinitely.

**Remedial action:** add a dedicated `TWIN_SIGNING_SECRET` (32+ random bytes, server-only, no `NEXT_PUBLIC_` prefix). Include an issued-at timestamp in the signed data, and reject tokens older than about an hour.

### M5. Model fallback order starts with models that are usually rate limited

**Where:** `app/api/chat/route.ts:4`

```ts
const MODELS = ["google/gemma-4-26b-a4b-it:free", "google/gemma-4-31b-it:free", "nvidia/nemotron-3-ultra-550b-a55b:free"];
```

During testing, both Gemma free models returned upstream `429` on every request, so each chat message first fails twice before reaching Nemotron.

**Remedial action:** based on the model test, use:

```ts
const MODELS = ["nvidia/nemotron-3.5-super-vl:free", "nvidia/nemotron-3-ultra-550b-a55b:free", "dots-studio/dots-3-note-preview:free"];
```

Re-test from time to time, because free-model availability changes often.

### M6. The chat shows raw parse errors when the server returns non-JSON

**Where:** `app/chat.tsx:44`

```ts
const data = await res.json();
if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
```

If the route crashes, or a proxy or platform returns an HTML error page (for example a 504 timeout), `res.json()` throws and the visitor sees a message like *"Unexpected token '<'…"*.

**Remedial action:** parse defensively:

```ts
const data = await res.json().catch(() => ({}));
if (!res.ok || typeof data.reply !== "string") throw new Error(data.error ?? "Something went wrong.");
```

Consider also retrying once automatically on `503` ("busy").

### M7. No tests, no linting, TypeScript strict mode off

**Where:** `package.json` (scripts are only `dev`, `build`, `start`), `tsconfig.json` (`"strict": false`)

The security behaviour of `/api/chat` (signature checks, validation, cleaning, leak detection) was verified only by hand. Nothing stops a later edit from breaking it.

**Remedial action:**

1. Set `"strict": true` in `tsconfig.json`. `tsc --strict` already passes with 0 errors, so this costs nothing.
2. Add ESLint (`eslint-config-next`) and a `lint` script.
3. Move `sign`, `verify`, `clean`, `leaksPrompt` and the message validation into `app/api/chat/guard.ts`, and unit-test them with Vitest. At minimum, cover: forged assistant turn, edited earlier turn, `null` message, wrong turn order, oversized body, invisible characters, and canary in the reply.
4. Add `"typecheck": "tsc --noEmit"` and `"test": "vitest run"` scripts, and run `typecheck`, `lint`, `test`, `build` and `pnpm audit` in CI.

---

## Low

### L1. Prompt-leak detection only matches fixed phrases

**Where:** `app/api/chat/route.ts:113-121`

The check looks for the canary and three English phrases. A translated, paraphrased or encoded leak (for example base64) passes. The impact is small, because the prompt contains only public CV data, but the protection is weaker than it looks.

**Remedial action:** keep the prompt free of anything you'd mind being public (true today). Optionally run a small guard model over replies, or compare replies against prompt sentences with fuzzy matching.

### L2. Footer year is frozen at build time

**Where:** `app/page.tsx:367`

```tsx
<span>© {new Date().getFullYear()} {name}</span>
```

`/` is prerendered as static (see the build output), so the year is computed at build time and goes stale on 1 January until the next deploy.

**Remedial action:** hard-code the year range, or render the year in a small client component.

### L3. React keys that may not be unique

**Where:** `app/page.tsx:252` (`key={c.company}`), `app/chat.tsx:86` (`key={i}`)

When the environment variables are missing, several jobs fall back to `"Company"`, which produces duplicate keys and a React warning. Index keys in the chat are fine while messages are only appended, but the error path now removes messages.

**Remedial action:** use `key={`${c.from}-${c.role}`}` for jobs, and give each chat message an `id` (for example `crypto.randomUUID()`) when it is created.

### L4. Broken contact links when environment variables are empty

**Where:** `app/page.tsx:16-35`, `:164-169`

Missing values produce `href=""`, `https://github.com/` and `mailto:`, which render as working-looking buttons that go nowhere.

**Remedial action:** filter `profiles` to entries with a non-empty handle, and hide the hero LinkedIn/GitHub buttons when their URL is empty.

### L5. Name handling assumes exactly two words, and initials are hard-coded

**Where:** `app/page.tsx:139` (`NA`), `:177-180`

`name.split(" ")[1]` drops any third name, and the `NA` mark ignores `NEXT_PUBLIC_NAME`.

**Remedial action:** split on the first space only (`const [first, ...rest] = name.split(" ")`), and derive the initials from the name.

### L6. Chat panel accessibility gaps

**Where:** `app/chat.tsx:60-113` (panel at `:75`)

- The panel `div` has an `aria-label` but no `role`, so screen readers ignore the label. Add `role="dialog"` (non-modal) or `role="region"`.
- Focus isn't moved to the input when the panel opens, and doesn't return to the toggle button when it closes.
- The `Escape` key doesn't close the panel.

**Remedial action:** add the role, focus management (`useEffect` on `open`) and an `onKeyDown` handler for `Escape`.

### L7. Turbopack picks up a stray lockfile in the home folder

**Where:** build and dev output:

```
⚠ Warning: Next.js ignored pnpm-lock.yaml in /Users/nunoaraujo because it is outside the current Git repository
```

There are a `package.json` and `pnpm-lock.yaml` in `/Users/nunoaraujo/`, outside this repository.

**Remedial action:** delete those stray files if they aren't used, or set `turbopack.root` in `next.config.ts` (see `turbopack.md` in the Next docs).

### L8. "Personal data lives in .env.local" is only partly true

**Where:** `app/page.tsx:7-8` (comment), `:37-129`, `app/api/chat/route.ts:52-63`

Company names and contact details are in environment variables. The committed code still contains towns (Braga, Porto, Barcelos), product names (RealPeritos, ESocial, Produz), scout events, initials and the full certificate list, which together identify you easily. Also, every `NEXT_PUBLIC_` value is inlined into the public JavaScript bundle, so these variables only keep data off GitHub, not off the live site.

**Remedial action:** decide what the goal is. If the goal is "nothing identifying on GitHub", move the remaining details (or the whole resume module from M3) out of git. If it isn't, simplify: commit the data and drop the environment variables, which would also fix H1, L4 and L5.

---

## What's done well

- **No XSS surface:** every message and value is rendered as React text, and there is no `dangerouslySetInnerHTML`.
- **Secrets handled correctly:** `OPENROUTER_API_KEY` is server-only. It isn't in the client bundle, and `.env*` files were never committed.
- **A layered chat defence:** HMAC-signed history, strict turn validation, field allow-listing, Unicode cleaning, body size caps, a sandwich system prompt, a canary, `<think>` stripping, a reply length cap, and friendly error messages that don't leak internals.
- **Accessibility basics:** a skip link, `:focus-visible` outlines, `aria-hidden` on decorative icons, `aria-labelledby` on sections, and `prefers-reduced-motion` respected in both CSS and `floor-plan.tsx`.
- **No hydration issues from the code itself:** `floor-plan.tsx` renders the same values on server and client and only starts drifting after mount.
- **Clean build:** it type-checks even in strict mode, and builds without warnings from the app code.

---

## Remedial action plan (in order)

| # | Action | Finding | Effort |
|---|---|---|---|
| 1 | Upgrade `next` to `16.4.2`, re-run `pnpm audit` and the build | C1 | 15 min |
| 2 | Fix the portrait import so a clean clone builds; verify with a fresh `git clone` + `pnpm install` + `pnpm build` | H1 | 15 min |
| 3 | Add a platform rate limit plus a global daily cap on `/api/chat` | H2 | 30–60 min |
| 4 | Reorder `MODELS` to the tested best free models | M5 | 2 min |
| 5 | Add `next.config.ts` with security headers | M1 | 20 min |
| 6 | Add a privacy notice under the chat | M2 | 10 min |
| 7 | Defensive `res.json()` in the chat, plus a retry on 503 | M6 | 10 min |
| 8 | Turn on `strict`, add ESLint, extract `guard.ts` and add Vitest tests, add CI | M7 | 2–3 h |
| 9 | Dedicated `TWIN_SIGNING_SECRET` and token expiry | M4 | 30 min |
| 10 | Single resume data module shared by page and prompt | M3, L8 | 1 h |
| 11 | Low items: keys, links, name handling, chat a11y, footer year, Turbopack root, leak detection | L1–L7 | 1–2 h |
