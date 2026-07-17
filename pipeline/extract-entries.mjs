// Step 2: extracted text -> Claude -> KB entries (JSON).
// Usage:
//   node extract-entries.mjs ../sources/tm9-803/fuel-section.txt \
//     --vehicle willys-mb --system fuel --doc "TM 9-803 (22 Feb 1944)" \
//     --out ../kb/willys-mb/fuel.json
//
// Needs ANTHROPIC_API_KEY in env. Use --dry-run to preview chunks without
// spending tokens.

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}
const flag = (name) => process.argv.includes(`--${name}`);

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node extract-entries.mjs <text-file> --vehicle X --system Y --doc "..." --out file.json [--dry-run]');
  process.exit(1);
}

const vehicle = arg('vehicle', 'willys-mb');
const system = arg('system', 'unknown');
const doc = arg('doc', 'unknown manual');
const outPath = arg('out', `./out/${vehicle}-${system}.json`);
const dryRun = flag('dry-run');
const PAGES_PER_CHUNK = 4; // ~4 manual pages ≈ small, reliable extraction unit

// --- chunk by page markers ---
const raw = readFileSync(resolve(inputPath), 'utf8');
const pageBlocks = raw.split(/(?==== PDF PAGE \d+ ===)/).filter((b) => b.trim());
const chunks = [];
for (let i = 0; i < pageBlocks.length; i += PAGES_PER_CHUNK) {
  chunks.push(pageBlocks.slice(i, i + PAGES_PER_CHUNK).join('\n'));
}
console.error(`${pageBlocks.length} pages -> ${chunks.length} chunk(s)`);

if (dryRun) {
  chunks.forEach((c, i) => console.error(`chunk ${i + 1}: ${c.length} chars, starts: ${c.slice(0, 60).replace(/\n/g, ' ')}`));
  process.exit(0);
}

// --- validation (fail loudly: bad specs are dangerous in a mechanic KB) ---
const TYPES = ['spec', 'part', 'procedure', 'issue', 'history'];
function validateEntry(e) {
  const errors = [];
  if (!e.id?.includes('/')) errors.push('id must be vehicle/system/slug');
  if (!TYPES.includes(e.type)) errors.push(`bad type: ${e.type}`);
  if (!e.title || !e.content) errors.push('missing title/content');
  if (!e.source?.doc || !e.source?.section) errors.push('missing source citation');
  if (e.confidence !== 'manual') errors.push('confidence must be "manual" for manual sources');
  return errors;
}

// --- extraction ---
const promptTemplate = readFileSync(join(__dirname, 'prompts', 'extract.md'), 'utf8');
const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const allEntries = [];
const allSkipped = [];

for (const [i, chunk] of chunks.entries()) {
  console.error(`extracting chunk ${i + 1}/${chunks.length}...`);
  const prompt = promptTemplate
    .replaceAll('{{DOC}}', doc)
    .replaceAll('{{VEHICLE}}', vehicle)
    .replaceAll('{{SYSTEM}}', system)
    .replace('{{TEXT}}', chunk);

  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content.map((b) => b.text ?? '').join('');
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    console.error(`chunk ${i + 1}: JSON parse failed — saving raw to debug file`);
    writeFileSync(`./debug-chunk-${i + 1}.txt`, text);
    continue;
  }

  for (const entry of parsed.entries ?? []) {
    const errors = validateEntry(entry);
    if (errors.length) {
      console.error(`  REJECTED "${entry.title}": ${errors.join('; ')}`);
      allSkipped.push({ what: entry.title, why: errors.join('; ') });
    } else {
      allEntries.push(entry);
    }
  }
  allSkipped.push(...(parsed.skipped ?? []));
}

// --- dedupe by id, merge with existing file if present ---
const existing = existsSync(resolve(outPath))
  ? JSON.parse(readFileSync(resolve(outPath), 'utf8')).entries ?? []
  : [];
const byId = new Map(existing.map((e) => [e.id, e]));
for (const e of allEntries) byId.set(e.id, e); // new extraction wins

const output = {
  vehicle,
  system,
  generatedAt: new Date().toISOString(),
  sourceDoc: doc,
  entries: [...byId.values()],
  skipped: allSkipped,
};

mkdirSync(dirname(resolve(outPath)), { recursive: true });
writeFileSync(resolve(outPath), JSON.stringify(output, null, 2));
console.error(`\n${output.entries.length} entries -> ${outPath} (${allSkipped.length} skipped — review these!)`);
