// Ask the Foreman — same agent loop as agent/ask.mjs, as an API route.
// POST { messages: [{role, content}] } -> { answer }
import Anthropic from '@anthropic-ai/sdk';
import { loadKb } from '@/lib/kb';
import { runAgent } from '@motorpool/core';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

  const result = await runAgent({ client, entries, messages, systemPrompt });

  if (result.ok) {
    return Response.json({ answer: result.answer }, { status: 200 });
  } else if (result.error === 'max_rounds') {
    return Response.json({ error: `Agent failed: ${result.error}` }, { status: 500 });
  } else if (result.error === 'api_error') {
    console.error(`Agent failed: ${result.error} - ${result.message}`);
    return Response.json({ error: `Agent failed: Please try again` }, { status: 502 });
  }
}
