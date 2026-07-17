# Fable Week Plan — v2 (agent-first)

Time-poor week: each session ends with a concrete artifact. The KB/agent pipeline is now the core, so the riskiest work moves first. Fable's edge — heavy extraction and end-to-end builds — maps directly onto sessions 1 and 2.

## Session plan

### Session 1 — Extraction spike (the make-or-break, do first)
Prove the ingestion agent works on real source material.
- Grab TM 9-803 (public domain PDF, free online), pick one system (e.g. fuel)
- Have Fable build the pipeline: PDF → text/OCR → Claude extraction → knowledge entries in the JSON schema from the brief
- Output: `/pipeline` scripts + one system's worth of real KB entries
- Why first: if 1940s scans won't extract cleanly, the whole plan changes — find out now

### Session 2 — Answer agent prototype
- SQLite + embeddings over the Session 1 entries, Claude answer agent with retrieval + citations
- Test with real mechanic questions; check it refuses when the KB has no answer (hallucinated specs are the #1 risk)
- Output: CLI or bare API route that answers with sources

### Session 3 — App shell + design system
- Next.js app, 1950s design tokens, chat ("Ask the Foreman") + browsable KB pages wired to the real data
- Output: running prototype, `npm run dev`

### Session 4 — Polish or breadth (pick one)
- Either: second system extracted + KB browse pages fleshed out
- Or: forum ingestion experiment (summarise-and-link pattern on a few G503 threads)

### If you only get 2 sessions
Do **1 and 2**. A pipeline that turns a 1940s manual into cited answers is the proof the idea works — UI can wait.

**3D viewer:** backlog. Revisit after V1 (models are ready when you are — Smithsonian/Sketchfab, see brief).

## Tips
- Point me at `PROJECT_BRIEF.md` at the start of each session — no re-explaining
- One goal per session; "stop and save" when time's up
- End each session: quick `NOTES.md` update (done / next)
