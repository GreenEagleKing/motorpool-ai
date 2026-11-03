import { readFileSync } from 'node:fs';

export type GoldenCase = {
  id: string;
  question: string;
  shouldAnswer: boolean;
  expectedIds: string[];
  mustMention: (string | string[])[];
};

const text = readFileSync(new URL('./golden.json', import.meta.url), 'utf8');
const cases: GoldenCase[] = JSON.parse(text);

console.log(cases.length);
