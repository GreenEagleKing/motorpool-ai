// Data-quality tests for every KB file. Run: node --test
// These guard the safety rules: every entry must be citable.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadKb } from '../lib/search.mjs';

const KB_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'kb');
const entries = loadKb(KB_DIR);
const TYPES = ['spec', 'part', 'procedure', 'issue', 'history'];

test('every entry has a full source citation', () => {
  for (const e of entries) {
    assert.ok(e.source?.doc, `${e.id}: missing source.doc`);
    assert.ok(e.source?.section, `${e.id}: missing source.section`);
    assert.ok(e.source?.page, `${e.id}: missing source.page`);
  }
});

test('every entry has a valid type and confidence', () => {
  for (const e of entries) {
    assert.ok(TYPES.includes(e.type), `${e.id}: bad type "${e.type}"`);
    assert.ok(['manual', 'forum-consensus', 'single-post'].includes(e.confidence), `${e.id}: bad confidence`);
  }
});

test('ids are unique and follow vehicle/system/slug', () => {
  const seen = new Set();
  for (const e of entries) {
    assert.equal(e.id.split('/').length, 3, `${e.id}: id must be vehicle/system/slug`);
    assert.ok(!seen.has(e.id), `duplicate id: ${e.id}`);
    seen.add(e.id);
  }
});

test('no empty titles or content', () => {
  for (const e of entries) {
    assert.ok(e.title?.trim(), `${e.id}: empty title`);
    assert.ok(e.content?.trim().length > 20, `${e.id}: suspiciously short content`);
  }
});
