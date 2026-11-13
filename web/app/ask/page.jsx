'use client';

import { useState, useRef, useEffect } from 'react';

// One per system the KB covers, plus one the KB can't answer (shows the refusal).
const EXAMPLES = [
  'Why is my engine running hot?',
  'What is the cylinder head torque?',
  'How do I clean the fuel strainer?',
  'What is the normal oil pressure?',
];

export default function AskPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  // Follow the conversation, but don't jump past the hero on first load.
  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  function send(e) {
    e.preventDefault();
    ask(input.trim());
  }

  // Shared by the form and the example buttons.
  async function ask(question) {
    if (!question || busy) return;

    const next = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.answer ?? `Trouble in the shop: ${data.error}` },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'Trouble in the shop: request failed. Is the dev server running with ANTHROPIC_API_KEY set?',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* ── Poster hero (short) ── */}
      <section className="halftone border-b-2 border-(--color-ink)">
        <div className="max-w-[1160px] mx-auto px-6 pt-11 pb-10 flex flex-col items-center text-center">
          <p className="display font-medium text-sm md:text-[17px] tracking-[3px] md:tracking-[6px] text-(--color-brass-deep) mb-3">
            ★ ★ ★ Service desk ★ ★ ★
          </p>
          <h1 className="display font-bold leading-[0.9] tracking-[-1px] text-(--color-olive-deep)">
            <span className="text-[48px] md:text-[76px]">Ask the </span>
            <span className="text-[64px] md:text-[104px] text-(--color-olive)">Foreman</span>
          </h1>
          <p className="script text-3xl md:text-[44px] leading-[1.1] text-(--color-brass-deep) -rotate-3 -mt-1.5">
            straight from the books!
          </p>
          <p className="mt-3.5 max-w-[560px] text-[17px] text-(--color-ink-soft)">
            Answers come from the manuals, with citations. If it&apos;s not in the books, the Foreman
            says so — he doesn&apos;t guess at specs.
          </p>
        </div>
      </section>
      <div aria-hidden="true" className="stripes h-5" />

      <div className="w-full max-w-[860px] mx-auto px-6 pt-10 pb-12 flex flex-col gap-7">
        {messages.length === 0 && (
          <div>
            <h2 className="kicker mb-3.5">★ Try one</h2>
            <div className="flex flex-wrap gap-2.5">
              {EXAMPLES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  disabled={busy}
                  className="btn-chip min-h-11 px-4 text-sm disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-[22px]">
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] flex flex-col items-end gap-1.5">
                  <span className="display font-medium text-[13px] tracking-[2px] text-(--color-ink-soft)">
                    You
                  </span>
                  <div className="bg-(--color-olive) text-(--color-paper) shadow-[5px_5px_0_var(--color-brass)] px-5 py-3.5">
                    {m.content}
                  </div>
                </div>
              </div>
            ) : (
              <article key={i} className="card hard-shadow">
                <div className="flex justify-between items-center gap-3 bg-(--color-brass) border-b-2 border-(--color-ink) px-5 py-2">
                  <span className="display font-bold text-[17px] tracking-[2px]">★ The Foreman</span>
                  <span className="display font-medium text-[13px] tracking-[2px] text-(--color-olive-deep)">
                    From the books
                  </span>
                </div>
                <p className="px-6 py-5 whitespace-pre-line leading-relaxed">{m.content}</p>
              </article>
            )
          )}
          {busy && (
            <p role="status" className="display font-medium text-[15px] tracking-[3px] text-(--color-ink-soft)">
              <span className="text-(--color-brass-deep)">★ ★ ★</span> Checking the manuals…
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={send}
          className="flex border-2 border-(--color-ink) bg-white shadow-[6px_6px_0_var(--color-ink)] sticky bottom-4"
        >
          <label htmlFor="ask-input" className="sr-only">
            Your question
          </label>
          <input
            id="ask-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1000}
            placeholder='e.g. "how do I clean the fuel strainer?"'
            className="flex-1 min-w-0 px-[18px] bg-transparent focus:outline-none placeholder:text-[#76705f]"
          />
          <button
            type="submit"
            disabled={busy}
            className="display min-h-14 border-l-2 border-(--color-ink) bg-(--color-brass) font-bold text-lg tracking-[1.5px] px-7 disabled:opacity-50"
          >
            Ask ★
          </button>
        </form>
      </div>
    </>
  );
}
