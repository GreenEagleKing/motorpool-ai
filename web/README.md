# Motor Pool — Web App

Next.js app: browsable KB pages + "Ask the Foreman" chat.

## Run it

```powershell
cd web
npm install
$env:ANTHROPIC_API_KEY = "sk-ant-..."   # only needed for /ask
npm run dev
```

Open http://localhost:3000

## Structure

- `app/page.jsx` — home
- `app/vehicle/willys-mb/` — vehicle file → system pages (server components, read `../kb` directly)
- `app/ask/` — chat UI (client) → `app/api/ask/route.js` (agent loop, same rules and system prompt as the CLI agent)
- `app/globals.css` — the 1950s design tokens (`@theme`): paper/ink palette, signal red, steel blue, work-order cards, stamp badges

## Notes

- Headings use Rockwell (ships with Windows); falls back to Georgia elsewhere. Swap for a webfont via `next/font` later if the fallback bothers you.
- The browse pages are static — adding KB files means rebuilding (`npm run dev` picks changes up live).
