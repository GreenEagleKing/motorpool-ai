# Interview stories

Short notes on decisions and tradeoffs worth talking through in interviews.
Each one: what I did, why, and the honest limitation.

## Rate limiting a serverless API (Nov 2026)

**Situation:** Motor Pool went live on Netlify as a public WIP. Every question calls the Claude API, so anyone with the URL could run up cost.

**What I built** (`web/app/api/ask/route.js`, `isRateLimited`):

- Fixed-window limiter: 10 questions per 10 minutes per IP, stored in a `Map` of `ip -> { start, count }`. Over the limit returns HTTP 429.
- IP comes from Netlify's `x-nf-client-connection-ip` header, not `x-forwarded-for`. The client can set `x-forwarded-for` to anything, so an abuser could send a fake IP on every request and never hit the limit. Netlify sets its header from the real connection.
- The rate-limit check is the first guard in the route, before JSON parsing and validation. Over-limit requests are rejected as cheaply as possible, and junk requests still use up the allowance.
- Alongside it: input validation (message count, question length, total history size, plain-text user/assistant roles only), a separate API key, and a monthly spend cap.

**Tradeoff / limitation:** the counts live in memory, which is best-effort on serverless:

- When an instance goes idle and shuts down, the counts are lost, so a returning abuser gets a fresh allowance.
- Several instances can run at once, each with its own `Map`, so one IP can get more than 10 across instances.

I chose this on purpose. It's a low-traffic WIP site, the spend cap is the hard backstop, and a shared store (Upstash Redis, Netlify Blobs) adds setup plus a network call per request. That shared store is the upgrade if traffic grows.

**Verified:** locally, 10 requests returned 400, the 11th and 12th returned 429, and a different IP got its own count.

## To write up

- Eval caught a mistake in the test, not the model (head-gasket sealant case: gaskets go in dry, so the "should refuse" label was wrong).
- Hallucination evidence: refusal answers cited section numbers that changed between runs (§60s vs §80s), proof the refs came from memory, not the KB.
- Serverless deploy: runtime file reads (`process.cwd()/..`) broke on Netlify. Fixed by importing the KB JSON and moving the prompt into code so the bundler includes them.
