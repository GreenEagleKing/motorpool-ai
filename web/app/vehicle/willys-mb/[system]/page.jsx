import { loadKb, systemsForVehicle } from '@/lib/kb';
import { notFound } from 'next/navigation';

const TYPE_ORDER = ['spec', 'part', 'procedure', 'issue', 'history'];
const TYPE_LABELS = {
  spec: 'Specifications',
  part: 'Parts',
  procedure: 'Procedures',
  issue: 'Known issues',
  history: 'Background',
};
const TYPE_STYLES = {
  spec: 'bg-(--color-brass) text-(--color-brass-deep)',
  part: 'bg-(--color-olive) text-(--color-paper)',
  procedure: 'bg-(--color-olive-drab) text-(--color-paper)',
  issue: 'bg-(--color-paper-dim) text-(--color-ink-soft)',
  history: 'bg-(--color-paper-dim) text-(--color-ink-soft)',
};

export function generateStaticParams() {
  const systems = systemsForVehicle(loadKb(), 'willys-mb');
  return [...systems.keys()].map((system) => ({ system }));
}

export default async function SystemPage({ params }) {
  const { system } = await params;
  const entries = loadKb().filter((e) => e.vehicle === 'willys-mb' && e.system === system);
  if (!entries.length) notFound();

  return (
    <div className="space-y-10">
      <div>
        <p className="kicker mb-3">Willys MB · section file</p>
        <h1 className="text-4xl font-bold tracking-tighter capitalize">{system} system</h1>
      </div>

      {TYPE_ORDER.map((type) => {
        const group = entries.filter((e) => e.type === type);
        if (!group.length) return null;
        return (
          <section key={type}>
            <h2 className="kicker mb-4">{TYPE_LABELS[type]}</h2>
            <div className="space-y-4">
              {group.map((e) => (
                <article key={e.id} className="card p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-base">{e.title}</h3>
                    <span
                      className={`pill shrink-0 text-[10px] tracking-[1.5px] px-3 py-1 uppercase ${TYPE_STYLES[e.type]}`}
                    >
                      {e.type}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-sm">{e.content}</p>
                  <p className="archive mt-4">
                    SOURCE: {e.source.doc} {e.source.section} · P.{e.source.page} · CONFIDENCE:{' '}
                    {e.confidence.toUpperCase()}
                  </p>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
