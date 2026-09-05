import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white font-display font-bold text-xs">
              EK
            </div>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white">
              GPI Eluzai Kids
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tempat anak-anak bertumbuh dalam iman, sukacita, dan kasih Kristus.
          </p>
          <div className="flex gap-4">
            <Link href="/schedule" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400">
              Jadwal
            </Link>
            <Link href="/events" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400">
              Event
            </Link>
            <Link href="/activities" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400">
              Kegiatan
            </Link>
            <Link href="/contact" className="text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400">
              Kontak
            </Link>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} GPI Eluzai Kids. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
