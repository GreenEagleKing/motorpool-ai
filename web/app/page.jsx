import Link from 'next/link';
import { loadKb, systemsForVehicle } from '@/lib/kb';

const STEPS = [
  {
    n: '01',
    title: 'extracted from the books',
    body: '1940s technical manuals digitised into parts, specs, and procedures.',
  },
  {
    n: '02',
    title: 'every entry cited',
    body: 'Each fact keeps its source — section, page, and confidence level.',
  },
  {
    n: '03',
    title: 'ask like a mechanic',
    body: "The Foreman answers from the books, or says straight when it's not in them.",
  },
];

const ALL_SYSTEMS = ['cooling', 'engine', 'fuel', 'electrical', 'brakes'];

export default function Home() {
  const entries = loadKb();
  const systems = systemsForVehicle(entries, 'willys-mb');
  const liveSystems = ALL_SYSTEMS.filter((s) => systems.has(s));
  const queuedSystems = ALL_SYSTEMS.filter((s) => !systems.has(s));

  return (
    <>
      {/* ── Poster hero ── */}
      <section className="halftone border-b-2 border-(--color-ink)">
        <div className="max-w-[1160px] mx-auto px-6 pt-16 pb-14 flex flex-col items-center text-center">
          <p className="display font-medium text-sm md:text-lg tracking-[3px] md:tracking-[6px] text-(--color-brass-deep) mb-[18px]">
            ★ ★ ★ From the 1944 War Department manuals ★ ★ ★
          </p>
          <h1 className="display font-bold leading-[0.88] tracking-[-1px] text-(--color-olive-deep)">
            <span className="block text-[64px] md:text-[132px]">Ask the</span>
            <span className="block text-[84px] md:text-[172px] text-(--color-olive)">Manual</span>
          </h1>
          <p className="script text-5xl md:text-[82px] leading-none text-(--color-brass-deep) -rotate-[4deg] -mt-2 md:-mt-[26px]">
            anything!
          </p>
          <p className="mt-[22px] max-w-[520px] text-lg text-(--color-ink-soft)">
            Original War Department manuals, structured and answerable — like a veteran mechanic
            who&apos;s read everything.
          </p>
          <div className="mt-[34px] flex flex-col items-center gap-3.5">
            <Link href="/ask" className="btn-primary min-h-[72px] px-10 text-[22px] md:text-[28px] tracking-[2px]">
              Ask the Foreman <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-1.5 text-sm text-(--color-ink-soft)">
              Every answer cited to the page · {liveSystems.join(', ')} systems live now
            </p>
            <Link
              href="/vehicle/willys-mb"
              className="display inline-flex items-center gap-2 min-h-11 px-1.5 font-medium text-base tracking-[2px] underline decoration-(--color-brass) decoration-[3px] underline-offset-[6px]"
            >
              or browse the vehicle files <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
      <div aria-hidden="true" className="stripes h-7" />

      <div className="w-full max-w-[1160px] mx-auto px-6 py-14 flex flex-col gap-14">
        {/* ── How the depot works ── */}
        <section className="card p-9">
          <h2 className="kicker mb-7">★ How the depot works</h2>
          <div className="grid md:grid-cols-3 gap-9">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col gap-2">
                <span className="display font-bold text-[56px] leading-none text-(--color-olive)">{s.n}</span>
                <p className="mt-1.5 font-bold text-[17px]">{s.title}</p>
                <p className="text-[15px] leading-relaxed text-(--color-ink-soft)">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Vehicle files ── */}
        <section>
          <div className="flex flex-wrap gap-3 items-center mb-[22px]">
            <h2 className="display font-bold text-[40px] tracking-[1px]">Vehicle files</h2>
            <span aria-hidden="true" className="flex-[1_1_80px] h-0.5 bg-(--color-ink)" />
            <Link
              href="/vehicle/willys-mb"
              className="display font-medium text-[17px] tracking-[1px] hover:underline"
            >
              All vehicles →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Link
              href="/vehicle/willys-mb"
              className="card hard-shadow p-[26px] flex flex-col gap-3 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex justify-between items-start gap-3">
                <span className="display font-bold text-[34px] leading-none">
                  Willys MB
                  <br />
                  Ford GPW
                </span>
                <span className="display font-medium text-[15px] tracking-[2px] bg-(--color-olive) text-(--color-paper) px-3 py-1">
                  ★ Live
                </span>
              </div>
              <p className="text-[15px] text-(--color-ink-soft)">
                ¼-ton 4×4 truck · {entries.length} entries from TM 9-803
              </p>
              <p className="display font-medium text-base tracking-[1px]">
                <span className="text-(--color-olive)">{liveSystems.join(' ★ ')}</span>
                {queuedSystems.length > 0 && (
                  <span className="text-[#76705f]"> · {queuedSystems.join(' · ')}</span>
                )}
              </p>
            </Link>

            <div className="relative overflow-hidden min-h-[190px] hatched border-2 border-dashed border-(--color-ink-faint) p-[26px] flex flex-col justify-center gap-1.5">
              <span className="display font-bold text-[28px] text-[#a39d8a]">M4 Sherman · GMC CCKW</span>
              <span className="text-[15px] text-[#a39d8a]">
                Next in the queue — manuals ready for extraction.
              </span>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="-rotate-[8deg] bg-(--color-paper) border-[3px] border-(--color-olive) shadow-[inset_0_0_0_3px_var(--color-paper),inset_0_0_0_5px_var(--color-olive),6px_6px_0_var(--color-brass)] px-4 md:px-[30px] py-2.5 md:py-3 whitespace-nowrap flex flex-col items-center gap-0.5">
                  <span className="display font-medium text-[13px] tracking-[4px] text-(--color-brass-deep)">
                    ★ ★ ★
                  </span>
                  <span className="display font-bold text-[30px] md:text-[44px] leading-none tracking-[2px] text-(--color-olive)">
                    Coming Soon
                  </span>
                  <span className="display font-medium text-[11px] md:text-[13px] tracking-[2px] md:tracking-[3px]">
                    M4 Sherman · GMC CCKW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Straight from the books ── */}
        <section className="flex flex-wrap gap-8 items-center border-y-2 border-(--color-ink) py-10">
          <div className="flex-[3_1_420px] min-w-0">
            <p className="kicker mb-2.5">Straight from the books</p>
            <p className="display font-medium text-[30px] leading-[1.2]">
              “Set the throttle stop screw so the engine idles at{' '}
              <span className="bg-(--color-brass) px-1.5">600 rpm</span>.”
            </p>
            <p className="mt-3.5 text-[15px] text-(--color-ink-soft)">
              Q: What idle speed should the engine run at? — TM 9-803 §72B, p.72 · confidence: manual
            </p>
          </div>
          <dl className="flex-[2_1_280px] grid grid-cols-3 gap-3 text-center">
            {[
              ['243', 'Manual pages'],
              [String(entries.length), 'KB entries'],
              ['100%', 'Cited'],
            ].map(([value, label]) => (
              <div key={label} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-xs font-bold tracking-[1.5px] uppercase">{label}</dt>
                <dd className="display font-bold text-[52px] leading-none text-(--color-olive)">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
