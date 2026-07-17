import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Motor Pool — WW2 Vehicle Knowledge Base',
  description: 'Original War Department manuals, structured and answerable.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Yellowtail&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <header>
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg tracking-tight">
              ★ motor pool
            </Link>
            <nav className="flex items-center gap-6 text-sm font-bold text-(--color-ink-soft)">
              <Link href="/vehicle/willys-mb" className="hover:text-(--color-olive)">
                vehicles
              </Link>
              <Link
                href="/ask"
                className="pill bg-(--color-olive) text-(--color-paper) px-5 py-2.5 hover:bg-(--color-olive-deep)"
              >
                ask the foreman
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">{children}</main>
        <footer className="bg-(--color-ink) mt-12">
          <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
            <span className="script text-xl text-(--color-brass)">keep &apos;em rolling</span>
            <span className="text-[10px] font-bold tracking-[1.5px] text-(--color-ink-faint)">
              WD TECHNICAL MANUALS · PUBLIC DOMAIN
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
