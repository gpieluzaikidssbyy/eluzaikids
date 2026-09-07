'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const VALID_SECTIONS = ['jadwal', 'event', 'kegiatan', 'lokasi', 'kontak'];

interface BackToHomeProps {
  variant?: 'hero' | 'primary' | 'secondary';
}

export function BackToHome({ variant = 'hero' }: BackToHomeProps) {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const section = VALID_SECTIONS.includes(from || '') ? from : '';
  const href = section ? `/?scroll=${section}` : '/';

  const arrow = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );

  if (variant === 'primary') {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
      >
        {arrow}
        Kembali
      </Link>
    );
  }

  if (variant === 'secondary') {
    return (
      <Link
        href={href}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-50 px-4 py-3 font-semibold text-brand-600 transition hover:bg-brand-100"
      >
        {arrow}
        Kembali
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
    >
      {arrow}
      Kembali
    </Link>
  );
}