// Motor Pool answer agent — CLI.
// Usage:
//   node ask.mjs "What's the idle speed on an MB?"
//   node ask.mjs "..." --retrieve-only     # show what retrieval finds, no API call
//
// Needs ANTHROPIC_API_KEY for full answers. --retrieve-only works without.

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAgent, loadKb, searchKb } from '@motorpool/core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const KB_DIR = join(__dirname, '..', 'kb');

const question = process.argv[2];
if (!question) {
  console.error('Usage: node ask.mjs "your question" [--retrieve-only]');
  process.exit(1);
}
const retrieveOnly = process.argv.includes('--retrieve-only');

const entries = loadKb(KB_DIR);
console.error(`KB loaded: ${entries.length} entries\n`);

if (retrieveOnly) {
  const hits = searchKb(entries, question);
  for (const h of hits) {
    console.log(`[${h.score}] ${h.id} (${h.type}) — ${h.title}  <${h.source.doc} ${h.source.section}>`);
  }
  if (!hits.length) console.log('(no hits — agent would refuse to answer)');
  process.exit(0);
}

const systemPrompt = readFileSync(join(__dirname, 'prompts', 'answer.md'), 'utf8');
const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const messages = [{ role: 'user', content: question }];

const result = await runAgent({ client, entries, messages, systemPrompt });

for (const s of result.searches) {
  console.error(`  search_kb("${s.query}") -> ${s.hitIds.length} hits: ${s.hitIds.join(', ')}`);
}

if (result.ok) {
  console.log(result.answer);
} else {
  if (result.error === 'api_error') {
    console.error(`Agent failed: ${result.error} - ${result.message}`);
  } else {
    console.error(`Agent failed: ${result.error}`);
  }
  process.exit(1);
}
