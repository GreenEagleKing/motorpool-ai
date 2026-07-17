// Tests for KB retrieval. Run: node --test  (from the agent/ folder)
// No API key needed — retrieval is pure JS.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadKb, searchKb } from '../lib/search.mjs';

const KB_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'kb');
const entries = loadKb(KB_DIR);

test('KB loads entries', () => {
  assert.ok(entries.length >= 20, `expected 20+ entries, got ${entries.length}`);
});

test('idle speed question finds the idle spec first', () => {
  const hits = searchKb(entries, 'What idle speed should the engine run at?');
  assert.equal(hits[0].id, 'willys-mb/fuel/idle-speed-spec');
});

test('strainer cleaning question finds the cleaning procedure first', () => {
  const hits = searchKb(entries, 'How do I clean the fuel strainer?');
  assert.equal(hits[0].id, 'willys-mb/fuel/fuel-strainer-cleaning');
});

test('tank capacity question finds the capacity spec first', () => {
  const hits = searchKb(entries, 'How big is the fuel tank?');
  assert.equal(hits[0].id, 'willys-mb/fuel/fuel-tank-capacity');
});

test('carburetor part number question finds the Carter entry', () => {
  const hits = searchKb(entries, 'What carburetor does the MB use?');
  assert.equal(hits[0].id, 'willys-mb/fuel/carburetor-part');
});

// The refusal cases: off-KB topics must return ZERO hits so the agent
// says "not covered" instead of answering from noise. If these fail after
// adding new systems (e.g. a brakes section), update them — that topic is
// now covered and SHOULD return hits.
test('brakes question returns no hits (not in KB yet)', () => {
  assert.equal(searchKb(entries, 'How do I adjust the brakes?').length, 0);
});

test('spark plug gap finds the tune-up (gap VALUE is still par 67, not yet extracted)', () => {
  const hits = searchKb(entries, 'spark plug gap');
  assert.equal(hits[0].id, 'willys-mb/engine/engine-tune-up');
});

test('tappet clearance question finds the clearance spec first', () => {
  const hits = searchKb(entries, 'What is the tappet clearance?');
  assert.equal(hits[0].id, 'willys-mb/engine/tappet-clearance');
});

test('cylinder head torque finds the torque spec first', () => {
  const hits = searchKb(entries, 'cylinder head torque');
  assert.equal(hits[0].id, 'willys-mb/engine/cylinder-head-torque');
});

test('steering question returns no hits (not in KB yet)', () => {
  assert.equal(searchKb(entries, 'steering wheel play').length, 0);
});

test('type filter works', () => {
  const hits = searchKb(entries, 'fuel pump', { type: 'spec' });
  assert.ok(hits.every((h) => h.type === 'spec'));
});
