import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { runAgent, loadKb } from '@motorpool/core';
import { retrievalPass, answerPass, isRefusal } from './grade.ts';

export type GoldenCase = {
  id: string;
  question: string;
  shouldAnswer: boolean;
  expectedIds: string[];
  mustMention: (string | string[])[];
};

const text = readFileSync(new URL('./golden.json', import.meta.url), 'utf8');
const cases: GoldenCase[] = JSON.parse(text);

const entries = loadKb(join(import.meta.dirname, '..', 'kb'));
const systemPrompt = readFileSync(join(import.meta.dirname, '..', 'agent', 'prompts', 'answer.md'), 'utf8');
const client = new Anthropic();

for (const golden of cases) {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: golden.question }];
  const result = await runAgent({ client, entries, messages, systemPrompt });

  if (!result.ok) {
    console.log(golden.id, result.error);
    continue;
  }
  const retrievalOk = retrievalPass(golden.expectedIds, result.searches);
  const answerOk = answerPass(golden.mustMention, result.answer);
  const refusalOk = isRefusal(result.answer) === !golden.shouldAnswer;

  console.log(golden.id, retrievalOk, answerOk, refusalOk);

  if (!refusalOk || !answerOk || !retrievalOk) {
    console.log(result.answer);
  }
}
