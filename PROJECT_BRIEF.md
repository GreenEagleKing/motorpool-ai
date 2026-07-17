# Motor Pool — Project Brief (v2)

*Working title. An agentic knowledge base for WW2 military vehicle mechanics and restorers — built from manuals, forums, and the web. Styled like a 1950s American service manual, with modern UX.*

---

## 1. The Idea (refined)

**One line:** Ask a question about your WW2 vehicle — "what's the tappet clearance on an MB engine?" — and get a sourced, mechanic-grade answer drawn from original manuals and decades of forum knowledge.

**The shift from v1:** this is not a hand-curated wiki. It's an **agent-powered knowledge base**:

- **Ingestion agent** — reads source material (TM manuals, forum threads, articles), extracts structured knowledge (parts, specs, procedures, known issues, fixes), and files it into the KB with source links
- **Answer agent** — the user-facing side: chat/search that retrieves from the KB and answers with citations, like a veteran mechanic who's read everything

**Why it's a real gap:** restoration knowledge lives in scanned 1940s TM PDFs and 20 years of forum threads (G503, Maple Leaf Up). It's all findable but none of it is *askable*. The agent makes it askable.

**3D models:** demoted to nice-to-have / later phase. Kept in backlog (free CC0 models exist — Smithsonian, Sketchfab).

## 2. Audience (priority order)

1. **Restorers/owners** — mid-repair questions: specs, torque values, "why is it doing X"
2. **Enthusiasts/historians** — history, variants, identification
3. **Museums** — later

## 3. V1 Scope — one vehicle, deep

**Willys MB / Ford GPW Jeep.** Best documentation (TM 9-803 public domain), biggest community (G503 forum), most restorations.

V1 features:
- **Ask** — chat interface, answers with citations back to source (manual page / forum thread)
- **Browse** — the extracted KB as readable pages: systems → parts, specs, procedures, known issues
- **Ingestion pipeline** — scripts/agent that turn source material into KB entries (starts manual-triggered, not autonomous)

**Not in V1:** 3D viewer, accounts, community features, autonomous crawling, more vehicles.

## 4. Architecture (the important part)

```
SOURCES                INGESTION AGENT             KNOWLEDGE BASE            ANSWER AGENT
─────────              ───────────────             ──────────────            ────────────
TM 9-803 (PDF)   ──►   Claude API:            ──►  Structured entries   ──►  RAG: retrieve
Forum threads          extract → structure         (Postgres/SQLite)         relevant entries
Web articles           → cite → dedupe             + vector index            → answer w/ cites
                                                   (embeddings)
```

**Knowledge entry (core unit):**
```json
{
  "type": "spec | procedure | part | issue | history",
  "vehicle": "willys-mb",
  "system": "engine",
  "title": "Tappet clearance adjustment",
  "content": "...",
  "source": { "kind": "manual", "ref": "TM 9-803 p.142", "url": "..." },
  "confidence": "manual | forum-consensus | single-post"
}
```

The `confidence` field matters: a spec from the official TM outranks one forum post. The answer agent should say which it's relying on — mechanics need to trust it.

## 5. Legal / sourcing (flag ⚠)

- **TM manuals, ordnance catalogues (SNL G-503):** US gov public domain — extract and republish freely. **This is your foundation.**
- **Forum posts / articles:** copyrighted. Don't republish text. Extract *facts* (specs, procedures aren't copyrightable), summarise in your own words, and **always link back** to the thread. Good citizenship also matters — these communities are small; scrape gently, credit loudly.
- Best practice: start ingestion with manuals only, add forum ingestion once the summarise-and-link pattern is solid.

## 6. Tech Stack (adjusted)

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js (React)** | Unchanged — you know JS/Node; SSR content pages + API routes for the agent |
| AI | **Claude API** (Messages + tool use) | Ingestion extraction + answer agent; tool use lets the agent search the KB |
| DB | **SQLite → Postgres (pgvector)** | SQLite + `sqlite-vec` is zero-infra for V1; pgvector when it grows |
| Embeddings | Voyage or OpenAI embedding API | For semantic retrieval over KB entries |
| Ingestion | Node scripts (repo `/pipeline`) | Manual PDFs → text → Claude extraction → JSON → DB |
| Mobile | PWA | Unchanged — offline garage use |
| Hosting | Vercel + Turso/Neon free tier | Zero-config |

**Cost note:** the answer agent burns API tokens per question. Fine for V1/personal use; if it gets real users you'll need caching of common Q&As (which conveniently *builds the browsable KB pages*).

## 7. Design Direction — unchanged

1950s service-manual aesthetic, modern layout. The chat interface has a natural skin here: the agent is the **"shop foreman"** — answers stamped like a work order, sources listed like a parts requisition slip. Leans into the theme without being kitsch.

## 8. Risks / Open Questions

- **PDF extraction quality** of 1940s scans is the make-or-break — needs OCR + Claude cleanup; prototype first
- **Hallucinated specs are dangerous** (someone torques a head bolt wrong). Mitigation: answer agent must quote retrieved entries, never answer from model memory; show confidence level
- Forum ingestion legality/etiquette (see §5) — phase 2
- Autonomous "keeps itself updated" crawling — much later; manual-triggered ingestion first

## 9. Backlog (post-V1)

3D viewer with part hotspots → more vehicles (Sherman, GMC CCKW) → community corrections/submissions → forum ingestion at scale → museum tools
