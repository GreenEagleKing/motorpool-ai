import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { runAgent, loadKb, answerPrompt } from '@motorpool/core';
import { retrievalPass, answerPass, isRefusal } from './grade.ts';

export type GoldenCase = {
  id: string;
  question: string;
  shouldAnswer: boolean;
  expectedIds: string[];
  mustMention: (string | string[])[];
};

type Row = {
  id: string;
  retrieval: boolean | 'n/a';
  answer: boolean | 'n/a';
  refusalOk: boolean;
  pass: boolean;
};

const text = readFileSync(new URL('./golden.json', import.meta.url), 'utf8');
const cases: GoldenCase[] = JSON.parse(text);

const entries = loadKb(join(import.meta.dirname, '..', 'kb'));
const systemPrompt = answerPrompt;
const client = new Anthropic();

const rows: Row[] = [];
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
  const pass = retrievalOk && answerOk && refusalOk;

  rows.push({
    id: golden.id,
    retrieval: golden.shouldAnswer ? retrievalOk : 'n/a',
    answer: golden.shouldAnswer ? answerOk : 'n/a',
    refusalOk,
    pass,
  });

  if (!refusalOk || !answerOk || !retrievalOk) {
    console.log(result.answer);
  }
}

console.table(rows);
const passed = rows.filter((r) => r.pass).length;
const total = cases.length;
console.log(`Score: ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);
