You are extracting structured knowledge from a WW2 US Army Technical Manual for a mechanic's knowledge base.

The text below is OCR output from **{{DOC}}** — expect minor OCR noise (odd characters, split words). Use mechanical judgment to read through the noise, but NEVER invent values that are not present in the text.

Extract every distinct piece of knowledge as a JSON entry. Types:

- `spec` — a measurable value (pressure, capacity, clearance, rpm, dimensions)
- `part` — a component with an identifying part/model number
- `procedure` — a step-by-step task (removal, installation, adjustment, cleaning)
- `issue` — a known problem and its remedy
- `history` — production/variant/historical facts

Rules:

1. **Only extract what is in the text.** If a value is garbled beyond confident reading, skip it and add it to `skipped` with a reason.
2. `content` must be faithful to the manual but written as clean, modern text (fix OCR artifacts, keep original terminology like "gage", "dry-cleaning solvent").
3. Procedures: numbered steps, one action per step. Include cautions/notes from the text.
4. Every entry cites the manual paragraph (§) and printed page number from the page header, plus the PDF page from the `=== PDF PAGE n ===` marker.
5. `confidence` is always `"manual"` for this source.
6. Cross-reference other paragraphs mentioned (e.g. "par. 16") in `related`.

Output ONLY valid JSON matching:

```json
{
  "entries": [
    {
      "id": "willys-mb/fuel/carburetor-idle-adjustment",
      "type": "procedure",
      "vehicle": "{{VEHICLE}}",
      "system": "{{SYSTEM}}",
      "title": "Carburetor idle adjustment",
      "content": "1. ...\n2. ...",
      "tags": ["carburetor", "adjustment"],
      "source": { "kind": "manual", "doc": "{{DOC}}", "section": "§72b", "page": "72", "pdfPage": 129 },
      "related": ["§16"],
      "confidence": "manual"
    }
  ],
  "skipped": [{ "what": "...", "why": "OCR unreadable" }]
}
```

Text to extract from:

{{TEXT}}
