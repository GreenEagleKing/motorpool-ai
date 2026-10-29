import Anthropic from '@anthropic-ai/sdk';
import { searchKb, type KbEntry, type EntryType } from './search.ts';

export type AgentOptions = {
  messages: Anthropic.MessageParam[];
  client: Anthropic;
  systemPrompt: string;
  maxRounds?: number;
  entries: KbEntry[];
};

export type SearchRecord = {
  query: string;
  type?: EntryType;
  hitIds: string[];
};

export type AgentResult = { searches: SearchRecord[] } & (
  | {
      ok: true;
      answer: string;
    }
  | {
      ok: false;
      error: 'max_rounds';
    }
  | {
      ok: false;
      error: 'api_error';
      message: string;
    }
);

const tools: Anthropic.Tool[] = [
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

export async function runAgent({
  client,
  entries,
  messages,
  systemPrompt,
  maxRounds = 5,
}: AgentOptions): Promise<AgentResult> {
  const history = [...messages];
  const searches: SearchRecord[] = [];

  for (let round = 0; round < maxRounds; round++) {
    let messageResponse: Anthropic.Message;
    try {
      messageResponse = await client.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        system: systemPrompt,
        messages: history,
        tools,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { searches, ok: false, error: 'api_error', message };
    }

    history.push({ role: 'assistant', content: messageResponse.content });
    if (messageResponse.stop_reason !== 'tool_use') {
      return {
        searches,
        ok: true,
        answer: messageResponse.content
          .filter((c) => c.type === 'text')
          .map((c) => c.text)
          .join(''),
      };
    }

    const results: Anthropic.ToolResultBlockParam[] = [];

    for (const block of messageResponse.content) {
      if (block.type !== 'tool_use') continue;

      const input = block.input as { query: string; type?: EntryType };
      const hits = searchKb(entries, input.query, { type: input.type ?? null });

      searches.push({ query: input.query, type: input.type, hitIds: hits.map((h) => h.id) });

      results.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(hits.map(({ score, ...entry }) => entry)),
      });
    }

    history.push({ role: 'user', content: results });
  }
  return { searches, ok: false, error: 'max_rounds' };
}
