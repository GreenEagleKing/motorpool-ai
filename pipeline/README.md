# Ingestion Pipeline

Manual PDF → text → Claude extraction → KB entries.

## Setup

```bash
cd pipeline
npm install
```

## Usage

```bash
# 1. Pull a page range out of a PDF (find ranges by skimming the PDF contents page)
node extract-text.mjs "../Manuals/Willys Jeep/TM9_803_1944.pdf" --from 127 --to 137 --out "../sources/tm9-803/fuel-section.txt"

# 2. Extract KB entries (needs ANTHROPIC_API_KEY set; --dry-run to preview chunks free)
node extract-entries.mjs "../sources/tm9-803/fuel-section.txt" \
  --vehicle willys-mb --system fuel --doc "TM 9-803 (22 Feb 1944)" \
  --out "../kb/willys-mb/fuel.json"
```

Re-running merges into the existing file (new extraction wins on duplicate ids).

## Notes

- Extraction prompt lives in `prompts/extract.md` — the schema and rules are there
- Entries failing validation are rejected loudly; check the `skipped` array in output — a wrong spec is worse than a missing one
- TM 9-803 section page ranges (PDF pages): Fuel/exhaust §70–78 = 127–137. Cooling starts 138. Map more sections as you go.
