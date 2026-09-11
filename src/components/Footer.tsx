'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/scan-qr')) return null;

  const copyrightText = '© 2026 GPI ELUZAI KIDS. ALL RIGHTS RESERVED';

  return (
    <footer className="mt-auto overflow-hidden bg-navy-900 py-4 text-white">
      <div className="animate-marquee flex w-max whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            aria-hidden={index > 0}
            className="flex shrink-0 items-center"
          >
            {copyrightText}
            <span aria-hidden="true" className="mx-8 opacity-70">
              •
            </span>
          </span>
        ))}
      </div>
    </footer>
  );
}
