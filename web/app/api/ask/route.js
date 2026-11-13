// Ask the Foreman — same agent loop as agent/ask.mjs, as an API route.
// POST { messages: [{role, content}] } -> { answer }
import Anthropic from '@anthropic-ai/sdk';
import { loadKb } from '@/lib/kb';
import { runAgent, answerPrompt } from '@motorpool/core';

// Caps on what a client can send. Every message in the history is re-sent to
// the model on each call, so these limits are what bound the cost per request.
const MAX_MESSAGES = 20; // ~10 questions + 10 answers
const MAX_QUESTION_CHARS = 1000; // one user question
const MAX_TOTAL_CHARS = 30000; // whole history (answers can be long)

const badRequest = (error) => Response.json({ error }, { status: 400 });

// Returns an error string, or null if the history is acceptable.
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 'messages required';
  if (messages.length > MAX_MESSAGES) return 'This chat is too long. Refresh the page to start a new one.';

  let total = 0;
  for (const m of messages) {
    // Plain text only: rejects fake tool_use / tool_result blocks and any other role.
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return 'Invalid message format';
    }
    if (m.role === 'user' && m.content.length > MAX_QUESTION_CHARS) {
      return `Question is too long (max ${MAX_QUESTION_CHARS} characters)`;
    }
    total += m.content.length;
  }
  if (total > MAX_TOTAL_CHARS) return 'This chat is too long. Refresh the page to start a new one.';
  if (messages.at(-1).role !== 'user') return 'Last message must be a question';
  return null;
}

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY is not set on the server' }, { status: 500 });
  }

  // request.json() throws on a body that isn't valid JSON.
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest('Request body must be JSON');
  }

  const problem = validateMessages(body?.messages);
  if (problem) return badRequest(problem);

  const entries = loadKb();
  const systemPrompt = answerPrompt; // shared with CLI + evals via core
  const client = new Anthropic();

  // Rebuild each message so only role + content reach the model.
  const messages = body.messages.map((m) => ({ role: m.role, content: m.content }));

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
