// Web apps connector to the shared core

import { searchKb } from '@motorpool/core';
import cooling from '../../kb/willys-mb/cooling.json';
import engine from '../../kb/willys-mb/engine.json';
import fuel from '../../kb/willys-mb/fuel.json';

export const loadKb = () => [...cooling.entries, ...engine.entries, ...fuel.entries];
export { searchKb };

export function systemsForVehicle(entries, vehicle) {
  const bySystem = new Map();
  for (const e of entries.filter((e) => e.vehicle === vehicle)) {
    if (!bySystem.has(e.system)) bySystem.set(e.system, []);
    bySystem.get(e.system).push(e);
  }
  return bySystem;
}
