// Server-side KB access for the web app.
// Reads ../kb (repo root) — same data the CLI agent uses, no duplication.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const KB_DIR = resolve(process.cwd(), '..', 'kb');

export function loadKb() {
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
  walk(KB_DIR);
  return entries;
}

export function systemsForVehicle(entries, vehicle) {
  const bySystem = new Map();
  for (const e of entries.filter((e) => e.vehicle === vehicle)) {
    if (!bySystem.has(e.system)) bySystem.set(e.system, []);
    bySystem.get(e.system).push(e);
  }
  return bySystem;
}

const STOPWORDS = new Set(
  'a an and are as at be by can do does for from how i in is it its of on or the to what when where which who why with you your'.split(' ')
);
const tokenize = (t) => (t.toLowerCase().match(/[a-z0-9][a-z0-9.-]*/g) ?? []).filter((x) => !STOPWORDS.has(x));
const stem = (t) => t.replace(/(ing|ers|er|ed|es|s)$/, '');
// Generic repair verbs score max 1 anywhere - stops 'adjust the brakes' false-hitting 'Valve tappet adjustment'.
const GENERIC = new Set(['adjust', 'adjustment', 'remov', 'removal', 'install', 'installation', 'clean', 'check', 'replac', 'servic', 'chang', 'use']);


export function searchKb(entries, query, { limit = 5, type = null, minScore = 3 } = {}) {
  const qTokens = [...new Set(tokenize(query).map(stem))];
  const scored = [];
  for (const e of entries) {
    if (type && e.type !== type) continue;
    const title = new Set(tokenize(e.title).map(stem));
    const tags = new Set(tokenize((e.tags ?? []).join(' ')).map(stem));
    const content = new Set(tokenize(e.content).map(stem));
    let score = 0;
    for (const t of qTokens) {
      if (GENERIC.has(t)) {
        if (title.has(t) || tags.has(t) || content.has(t)) score += 1;
        continue;
      }
      if (title.has(t)) score += 3;
      if (tags.has(t)) score += 2;
      if (content.has(t)) score += 1;
    }
    if (score >= minScore) scored.push({ score, entry: e });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(({ entry }) => entry);
}
