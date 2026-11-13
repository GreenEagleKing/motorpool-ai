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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;700&family=Yellowtail&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <div className="bg-(--color-ink) text-(--color-paper) text-[13px] font-medium text-center px-6 py-2">
          <span className="text-(--color-brass)">★</span> Work in progress: covers the Willys MB cooling, engine
          and fuel systems only (TM 9-803). <span className="text-(--color-brass)">★</span>
        </div>
        <header className="border-b-2 border-(--color-ink)">
          <div className="max-w-[1160px] mx-auto px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
            <Link href="/" className="display font-bold text-[26px] tracking-[1px]">
              ★ Motor Pool
            </Link>
            <nav className="display flex items-center gap-2 font-medium text-[17px] tracking-[1px]">
              <Link href="/vehicle/willys-mb" className="px-4 py-2.5 hover:underline">
                Vehicles
              </Link>
              <Link
                href="/ask"
                className="bg-(--color-olive) text-(--color-paper) px-5 py-2.5 hover:bg-(--color-olive-deep)"
              >
                Ask the Foreman
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 w-full flex flex-col">{children}</main>
        <footer className="bg-(--color-brass) border-t-2 border-(--color-ink)">
          <div className="max-w-[1160px] mx-auto px-6 py-[18px] flex flex-wrap gap-3 items-center justify-between">
            <span className="script text-[30px] text-(--color-olive-deep)">keep &apos;em rolling!</span>
            <span className="display font-medium text-sm tracking-[2px] text-(--color-olive-deep)">
              ★ WD Technical Manuals · Public Domain ★
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
