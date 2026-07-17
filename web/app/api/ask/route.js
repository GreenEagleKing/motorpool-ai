// Ask the Foreman — same agent loop as agent/ask.mjs, as an API route.
// POST { messages: [{role, content}] } -> { answer }
import Anthropic from '@anthropic-ai/sdk';
import { loadKb, searchKb } from '@/lib/kb';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tools = [
  {
    name: 'search_kb',
    description:
      'Search the Motor Pool knowledge base of manual-sourced entries (specs, parts, procedures, issues, history). Returns the top matching entries with full content and source citations.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords to search for' },
        type: { type: 'string', enum: ['spec', 'part', 'procedure', 'issue', 'history'], description: 'Optional filter' },
      },
      required: ['query'],
    },
  },
];

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY is not set on the server' }, { status: 500 });
  }

  const { messages: userMessages } = await request.json();
  if (!Array.isArray(userMessages) || !userMessages.length) {
    return Response.json({ error: 'messages required' }, { status: 400 });
  }

  const entries = loadKb();
  // The system prompt is shared with the CLI agent — one source of truth
  const systemPrompt = readFileSync(resolve(process.cwd(), '..', 'agent', 'prompts', 'answer.md'), 'utf8');
  const client = new Anthropic();

  const messages = userMessages.map((m) => ({ role: m.role, content: m.content }));

  for (let turn = 0; turn < 6; turn++) {
    const msg = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2000,
      system: systemPrompt,
      tools,
      messages,
    });

    messages.push({ role: 'assistant', content: msg.content });

    if (msg.stop_reason !== 'tool_use') {
      return Response.json({ answer: msg.content.map((b) => b.text ?? '').join('') });
    }

    const results = [];
    for (const block of msg.content) {
      if (block.type !== 'tool_use') continue;
      const hits = searchKb(entries, block.input.query, { type: block.input.type ?? null });
      results.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(hits, null, 2),
      });
    }
    messages.push({ role: 'user', content: results });
  }

  return Response.json({ error: 'agent exceeded max turns' }, { status: 500 });
}
