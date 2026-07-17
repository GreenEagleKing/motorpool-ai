// Keyword retrieval over the KB JSON files.
// Why not embeddings yet: at ~25 entries, weighted keyword scoring retrieves
// as well as vectors with zero extra infra/API keys. Swap this module for an
// embedding index when the KB is in the thousands — the interface stays the same.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const STOPWORDS = new Set(
  'a an and are as at be by can do does for from how i in is it its of on or the to what when where which who why with you your'.split(' ')
);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9.-]*/g) ?? []).filter((t) => !STOPWORDS.has(t));
}

// crude singular/plural + verb-ish stemming so "cleaning" matches "clean"
function stem(t) {
  return t.replace(/(ing|ers|er|ed|es|s)$/, '');
}
// Generic repair verbs score max 1 anywhere - stops 'adjust the brakes' false-hitting 'Valve tappet adjustment'.
const GENERIC = new Set(['adjust', 'adjustment', 'remov', 'removal', 'install', 'installation', 'clean', 'check', 'replac', 'servic', 'chang', 'use']);


export function loadKb(kbDir) {
  const entries = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.json')) {
        const file = JSON.parse(readFileSync(p, 'utf8'));
        entries.push(...(file.entries ?? []));
      }
    }
  };
  walk(resolve(kbDir));
  return entries;
}

// minScore 3 = at least one title-word match (or several weak content matches).
// Below that, hits are coincidental word overlap — returning them tempts the
// agent to answer from noise, and refusing is safer than guessing.
export function searchKb(entries, query, { limit = 5, system = null, type = null, minScore = 3 } = {}) {
  const qTokens = [...new Set(tokenize(query).map(stem))];
  const scored = [];

  for (const e of entries) {
    if (system && e.system !== system) continue;
    if (type && e.type !== type) continue;

    const titleTokens = new Set(tokenize(e.title).map(stem));
    const tagTokens = new Set(tokenize((e.tags ?? []).join(' ')).map(stem));
    const contentTokens = new Set(tokenize(e.content).map(stem));

    let score = 0;
    for (const t of qTokens) {
      if (GENERIC.has(t)) {
        if (titleTokens.has(t) || tagTokens.has(t) || contentTokens.has(t)) score += 1;
        continue;
      }
      if (titleTokens.has(t)) score += 3;
      if (tagTokens.has(t)) score += 2;
      if (contentTokens.has(t)) score += 1;
    }
    if (score >= minScore) scored.push({ score, entry: e });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ score, entry }) => ({ score, ...entry }));
}
