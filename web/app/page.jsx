import Link from 'next/link';
import Emblem from '@/components/Emblem';
import { loadKb, systemsForVehicle } from '@/lib/kb';

const STEPS = [
  {
    n: 1,
    title: 'extracted from the books',
    body: '1940s technical manuals digitised into parts, specs, and procedures.',
  },
  {
    n: 2,
    title: 'every entry cited',
    body: 'Each fact keeps its source — section, page, and confidence level.',
  },
  {
    n: 3,
    title: 'ask like a mechanic',
    body: "The Foreman answers from the books, or says straight when it's not in them.",
  },
];

export default function Home() {
  const entries = loadKb();
  const systems = systemsForVehicle(entries, 'willys-mb');
  const procedures = entries.filter((e) => e.type === 'procedure').length;

  return (
    <div className="space-y-10">
      <section className="grid md:grid-cols-[3fr_2fr] gap-8 items-center py-6">
        <div>
          <p className="kicker mb-4">From the 1944 War Department manuals</p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter leading-[0.96]">
            ask the manual
            <br />
            <span className="script text-[1.1em] text-(--color-olive)">anything</span>
          </h1>
          <p className="text-(--color-ink-soft) max-w-sm mt-4 leading-relaxed">
            Original War Department manuals, structured and answerable — like a veteran mechanic
            who&apos;s read everything.
          </p>
          <Link
            href="/ask"
            className="mt-6 bg-white rounded-full flex items-center justify-between p-2 pl-5 max-w-md hover:-translate-y-0.5 transition-transform"
          >
            <span className="text-sm text-(--color-ink-faint)">
              what&apos;s the fuel pump pressure?
            </span>
            <span className="pill bg-(--color-olive) text-(--color-paper) text-sm px-5 py-2.5">ask</span>
          </Link>
        </div>
        <div className="hidden md:flex justify-center">
          <Emblem />
        </div>
      </section>

      <section className="bg-(--color-olive-deep) rounded-[18px] p-7">
        <p className="kicker !text-(--color-brass) mb-5">How the depot works</p>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="roundel w-9 h-9 bg-(--color-brass) text-(--color-olive-deep) text-[15px]">
                {s.n}
              </div>
              <p className="font-bold text-sm text-(--color-paper) mt-3 mb-1">{s.title}</p>
              <p className="text-xs text-(--color-khaki) leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-baseline mb-4">
          <p className="kicker">Vehicle files</p>
          <Link href="/vehicle/willys-mb" className="text-xs font-bold text-(--color-olive)">
            all vehicles →
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/vehicle/willys-mb" className="card p-6 block hover:-translate-y-0.5 transition-transform">
            <div className="flex justify-between items-start">
              <p className="font-bold text-lg">willys mb / ford gpw</p>
              <span className="pill bg-(--color-olive) text-(--color-paper) text-[10px] tracking-[1.5px] px-3 py-1">
                LIVE
              </span>
            </div>
            <p className="text-xs text-(--color-ink-soft) mt-1.5 mb-4">
              ¼-ton 4×4 truck · {entries.length} entries from TM 9-803
            </p>
            <div className="flex gap-1.5">
              {['fuel', 'engine', 'electrical', 'brakes'].map((sys) => {
                const live = systems.has(sys);
                return (
                  <span
                    key={sys}
                    className={`roundel w-8 h-8 text-[13px] ${
                      live
                        ? 'bg-(--color-olive) text-(--color-paper)'
                        : 'bg-(--color-paper-dim) text-(--color-ink-faint)'
                    }`}
                  >
                    {sys[0].toUpperCase()}
                  </span>
                );
              })}
            </div>
          </Link>
          <div className="card-dim p-6 flex flex-col justify-center">
            <p className="font-bold text-(--color-ink-faint)">m4 sherman · gmc cckw</p>
            <p className="text-xs text-(--color-ink-faint) mt-1.5">
              next in the queue — manuals ready for extraction
            </p>
          </div>
        </div>
      </section>

      <section>
        <p className="kicker mb-4">Straight from the books</p>
        <div className="grid md:grid-cols-[3fr_2fr] gap-4 items-stretch">
          <div className="card p-6">
            <p className="text-sm font-bold text-(--color-olive)">
              Q: what idle speed should the engine run at?
            </p>
            <p className="text-sm mt-2.5 leading-relaxed">
              Set the throttle stop screw so the engine idles at{' '}
              <span className="bg-(--color-brass) font-bold px-1 rounded">600 rpm</span> (vehicle
              speed 8 mph), after adjusting the idle mixture screw.
            </p>
            <p className="archive mt-4">SOURCE: TM 9-803 §72B · P.72 · CONFIDENCE: MANUAL</p>
          </div>
          <div className="grid grid-rows-3 gap-2.5">
            <div className="rounded-[14px] bg-(--color-olive) px-5 flex items-center justify-between">
              <span className="text-xl font-bold text-(--color-paper)">243</span>
              <span className="text-[10px] font-bold tracking-[1.5px] text-(--color-olive-tint)">
                MANUAL PAGES
              </span>
            </div>
            <div className="rounded-[14px] bg-(--color-olive-drab) px-5 flex items-center justify-between">
              <span className="text-xl font-bold text-(--color-paper)">{entries.length}</span>
              <span className="text-[10px] font-bold tracking-[1.5px] text-(--color-khaki)">
                KB ENTRIES
              </span>
            </div>
            <div className="rounded-[14px] bg-(--color-brass) px-5 flex items-center justify-between">
              <span className="text-xl font-bold">100%</span>
              <span className="text-[10px] font-bold tracking-[1.5px] text-(--color-brass-deep)">
                CITED
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
