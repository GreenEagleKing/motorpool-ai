# motorpool-ai

An agentic knowledge base for WW2 military vehicle mechanics and restorers. Original War Department technical manuals, extracted into structured data and answerable with citations — like a veteran mechanic who's read everything.

## How it works

```
Manuals (PDF) → pipeline (extract + structure via Claude) → kb/*.json → agent & web app
```

- **`pipeline/`** — PDF → text → Claude extraction → validated KB entries. See `pipeline/README.md`.
- **`kb/`** — the knowledge base: JSON entries with type, source citation (manual §/page), and confidence level. This is the product.
- **`agent/`** — "the Shop Foreman": CLI answer agent with retrieval + citations. Refuses to answer from model memory — a wrong torque spec is worse than no answer. Tests: `npm test`. See `agent/README.md`.
- **`web/`** — Next.js app: browsable KB + Ask the Foreman chat. See `web/README.md`.
- **`sources/`** — extracted manual text (regenerable, kept for provenance).

`Manuals/` (source PDFs, ~111MB) is gitignored — the manuals are US public domain and freely downloadable (TM 9-803 etc.).

## Quick start

```bash
cd web && npm install && npm run dev        # browse works immediately
# set ANTHROPIC_API_KEY for /ask and the extraction pipeline
```

## Ground rules

- Every KB fact carries its citation; extraction skips OCR-garbled values rather than guessing (see `skipped` arrays)
- `agent/lib/search.mjs` and `web/lib/kb.js` contain duplicated retrieval logic — change both or neither (workspace refactor pending)
- Verify anything from this KB against the original manual before working on a real vehicle

Project log: `NOTES.md` · Brief: `PROJECT_BRIEF.md`
