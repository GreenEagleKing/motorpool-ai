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
import { loadKb, searchKb } from './lib/search.mjs';

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

const tools = [
  {
    name: 'search_kb',
    description:
      'Search the Motor Pool knowledge base of manual-sourced entries (specs, parts, procedures, issues, history). Returns the top matching entries with full content and source citations.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords to search for' },
        type: {
          type: 'string',
          enum: ['spec', 'part', 'procedure', 'issue', 'history'],
          description: 'Optional filter',
        },
      },
      required: ['query'],
    },
  },
];

const systemPrompt = readFileSync(join(__dirname, 'prompts', 'answer.md'), 'utf8');
const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const messages = [{ role: 'user', content: question }];

let rounds = 0;
while (rounds < 5) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    system: systemPrompt,
    tools,
    messages,
  });

  messages.push({ role: 'assistant', content: msg.content });

  if (msg.stop_reason !== 'tool_use') {
    console.log(msg.content.map((b) => b.text ?? '').join(''));
    break;
  }

  const results = [];
  for (const block of msg.content) {
    if (block.type !== 'tool_use') continue;
    const hits = searchKb(entries, block.input.query, {
      type: block.input.type ?? null,
    });
    console.error(`  search_kb("${block.input.query}") -> ${hits.length} hits`);
    results.push({
      type: 'tool_result',
      tool_use_id: block.id,
      content: JSON.stringify(
        hits.map(({ score, ...e }) => e), // strip internal score
        null,
        2
      ),
    });
  }
  messages.push({ role: 'user', content: results });
  rounds++;
}

if (rounds >= 5) {
  console.error('Max rounds reached, aborting.');
  process.exit(1);
}
