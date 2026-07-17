# Answer Agent — "the Shop Foreman"

Retrieval + Claude over the KB, with citations. Refuses to answer when the KB has no coverage — it never states specs from model memory (a wrong torque value is worse than no answer).

## Setup

```bash
cd agent
npm install
# Windows (PowerShell): $env:ANTHROPIC_API_KEY="sk-ant-..."
```

## Usage

```bash
# Full answer (needs API key)
node ask.mjs "What idle speed should the engine run at?"

# See what retrieval finds without spending tokens
node ask.mjs "How do I clean the fuel strainer?" --retrieve-only
```

## How it works

1. Loads every entry from `../kb/**/*.json`
2. Claude gets a `search_kb` tool (keyword scoring: title ×3, tags ×2, content ×1, min score 3) and searches before answering
3. System prompt (`prompts/answer.md`) enforces: answer only from retrieved entries, cite `[TM 9-803 §72b, p.72]`, refuse when nothing relevant

## Deliberate choices

- **Keyword search, not embeddings** — at 25 entries vectors add infra and a second API key for no retrieval gain. `lib/search.mjs` is a module boundary: swap in an embedding index later without touching the agent.
- **Min score threshold** — off-topic questions ("how do I adjust the brakes?") get zero hits rather than noise, so the agent refuses instead of improvising.
