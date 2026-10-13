// Web apps connector to the shared core

import { loadKb as loadKbFrom, searchKb } from '@motorpool/core';
import { resolve } from 'node:path';

export const loadKb = () => loadKbFrom(KB_DIR);
export { searchKb };

const KB_DIR = resolve(process.cwd(), '..', 'kb');

export function systemsForVehicle(entries, vehicle) {
  const bySystem = new Map();
  for (const e of entries.filter((e) => e.vehicle === vehicle)) {
    if (!bySystem.has(e.system)) bySystem.set(e.system, []);
    bySystem.get(e.system).push(e);
  }
  return bySystem;
}
