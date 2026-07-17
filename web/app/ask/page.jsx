'use client';

import { useState, useRef, useEffect } from 'react';

export default function AskPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  async function send(e) {
    e.preventDefault();
    const question = input.trim();
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="kicker mb-3">Service desk</p>
        <h1 className="text-4xl font-bold tracking-tighter">
          ask the <span className="script text-[1.1em] text-(--color-olive)">foreman</span>
        </h1>
        <p className="text-(--color-ink-soft) mt-2 text-sm leading-relaxed">
          Answers come from the manuals, with citations. If it&apos;s not in the books, the Foreman
          says so — he doesn&apos;t guess at specs.
        </p>
      </div>

      <div className="space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <div
              className={
                m.role === 'user'
                  ? 'inline-block bg-(--color-olive) text-(--color-paper) px-5 py-2.5 rounded-[18px] rounded-br-md max-w-[85%] text-left text-sm'
                  : 'card p-5 whitespace-pre-line leading-relaxed text-sm'
              }
            >
              {m.role === 'assistant' && (
                <p className="text-[10px] font-bold tracking-[1.5px] text-(--color-brass-soft) mb-2">
                  FOREMAN
                </p>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <p className="text-[10px] font-bold tracking-[1.5px] text-(--color-ink-faint)">
            CHECKING THE MANUALS…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="bg-white rounded-full flex items-center p-2 pl-5 sticky bottom-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "how do I clean the fuel strainer?"'
          className="flex-1 text-sm focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={busy}
          className="pill bg-(--color-olive) text-(--color-paper) text-sm px-6 py-2.5 disabled:opacity-50"
        >
          ask
        </button>
      </form>
    </div>
  );
}
