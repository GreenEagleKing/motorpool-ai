# Session Notes

## Session 4 — 17 Jul 2026 — Design applied + engine extraction ✅

**Done:**
- New design (clean bold, olive/brass, emblem) applied across the app — build verified
- Engine system extracted from TM 9-803 §50–61 → `kb/willys-mb/engine.json` (19 entries: tabulated data, tappet clearance 0.014 in, cylinder head torque 65–70/60–65 ft-lb, tune-up, engine R&I)
- Honesty case: max torque OCR-garbled ("9S ft-lb") — skipped with reason, not guessed. Check against a clean scan later.
- Retrieval fix: generic repair verbs (adjust/remove/install/clean...) now score max 1 — "adjust the brakes" no longer false-hits "Valve tappet adjustment". Patched BOTH `agent/lib/search.mjs` and `web/lib/kb.js` (keep these in parity!)
- Tests updated + expanded: 15 pass. Note: cooling.json (Ben's own pipeline run) validated clean — pipeline proven end-to-end without Claude in the loop.

**Next session options:**
- Extract ignition (§62–69) — completes the spark plug gap story (par 67)
- Electrical/brakes sections, or TM9-1803A deep engine manual
- Deploy to Vercel so it's shareable

**Design decisions locked:** type rules (bold sans = structure, script ×2 max = voice, courier = verbatim archive only), no hard borders (blocks + radius), olive #3d5c3a / deep #2f3324 / brass #d9b44a / cream #f4eedd.


## Session 3 — 17 Jul 2026 — App shell ✅

**Done:**
- Next.js app in `/web` (JS, App Router, Tailwind v4) — built manually, no create-next-app cruft
- 1950s design tokens in `globals.css` (@theme): paper/ink, signal red, steel blue, work-order cards with offset shadows, rotated stamp badges, requisition-slip citations
- Browse pages: home → vehicle file → system page; entries grouped by type, every card shows SOURCE + CONFIDENCE
- "Ask the Foreman" chat: client page + `/api/ask` route running the same tool-use loop and system prompt as the CLI agent (prompt is shared from `agent/prompts/answer.md` — one source of truth)
- Verified: `next build` passes, pages render real KB data, API route fails safely without key

**Ben to run:** `cd web && npm install && npm run dev` (set ANTHROPIC_API_KEY for /ask)

**Next (Session 4 — pick one):**
- Extract more systems (engine manual TM9-1803A is richer than TM 9-803's engine section) → browse pages fill out automatically
- Or forum ingestion experiment (summarise-and-link, G503 threads)
- Stretch: `<model-viewer>` spike with a free Jeep glTF on the vehicle page

**Gotcha:** npm install into the mounted project folder is extremely slow from the sandbox — build/test in /tmp there; Ben's local installs are unaffected.


## Session 2 — 17 Jul 2026 — Answer agent ✅

**Done:**
- Built `/agent`: `ask.mjs` CLI — Claude with a `search_kb` tool over `kb/**/*.json`, "Shop Foreman" system prompt
- Keyword retrieval (`lib/search.mjs`), not embeddings — right call at 25 entries; module boundary makes swapping to vectors later trivial
- Tested retrieval: correct top hit for every on-topic question; min-score threshold makes off-KB questions (brakes, spark plugs) return zero hits → agent refuses instead of guessing
- Safety rules in the prompt: answer only from retrieved entries, cite every claim, never state specs from model memory

**Not yet tested:** the full Claude loop (`node ask.mjs "..."` without `--retrieve-only`) needs Ben's ANTHROPIC_API_KEY — retrieval side is verified, first live run is Ben's.

**Next (Session 3 — app shell):**
- Next.js app, 1950s design tokens, "Ask the Foreman" chat + browsable KB pages wired to `kb/`
- Optional prep: extract another system (engine manual TM9-1803A is in Manuals/) to make browse pages more interesting

**Gotcha (workflow):** editor writes to `.mjs` files sometimes truncate when syncing to the sandbox — if a script suddenly throws `SyntaxError: Unexpected end of input`, rewrite the file via shell.


## Session 1 — 15 Jul 2026 — Extraction spike ✅

**Done:**
- Inspected TM 9-803 PDF (243 pages): has a usable OCR text layer — no OCR step needed
- Built `/pipeline`: `extract-text.mjs` (PDF → text, pure-JS pdfjs, works on Windows) + `extract-entries.mjs` (text → Claude → validated KB JSON) + extraction prompt
- Extracted the full fuel & exhaust section (§70–78, PDF pages 127–137) → `kb/willys-mb/fuel.json`: **25 entries** (15 procedures, 4 parts, 3 specs, 3 overviews)
- Verified every part number and spec against the manual text — all match

**Verdict: the make-or-break test passed.** 1940s manuals extract cleanly into structured, cited KB entries.

**Next (Session 2 — answer agent):**
- SQLite + embeddings over `fuel.json`
- Claude answer agent with retrieval + citations; must refuse when KB has no answer
- Ben: get an `ANTHROPIC_API_KEY` (console.anthropic.com) so `extract-entries.mjs` can run on more sections

**Gotchas found:**
- The OCR data table on p.71 has label/value pairs that pdftotext scrambles — pdfjs (our script) keeps them on one line. Use our script, not pdftotext.
- Figure callout lists (exploded diagrams) are skipped for now — revisit as image hotspots later.
