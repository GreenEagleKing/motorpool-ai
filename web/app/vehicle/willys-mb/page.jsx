import Link from 'next/link';
import { loadKb, systemsForVehicle } from '@/lib/kb';

export const metadata = { title: 'Willys MB / Ford GPW — Motor Pool' };

export default function VehiclePage() {
  const entries = loadKb();
  const systems = systemsForVehicle(entries, 'willys-mb');

  return (
    <div className="space-y-8">
      <div>
        <p className="kicker mb-3">Vehicle file · TM 9-803</p>
        <h1 className="text-4xl font-bold tracking-tighter">willys mb / ford gpw</h1>
        <p className="text-(--color-ink-soft) mt-2 max-w-2xl text-sm leading-relaxed">
          ¼-ton 4×4 truck, the standard light vehicle of the U.S. Army. Willys-Overland built the
          MB; Ford built the near-identical GPW. Pick a system below.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[...systems.entries()].map(([system, systemEntries]) => (
          <Link
            key={system}
            href={`/vehicle/willys-mb/${system}`}
            className="card p-6 block hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="roundel w-9 h-9 bg-(--color-olive) text-(--color-paper) text-[15px]">
                {system[0].toUpperCase()}
              </span>
              <h2 className="font-bold text-lg capitalize">{system}</h2>
            </div>
            <p className="text-xs text-(--color-ink-faint) mt-3 font-bold tracking-wide">
              {systemEntries.length} ENTRIES ·{' '}
              {systemEntries.filter((e) => e.type === 'procedure').length} PROCEDURES
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
