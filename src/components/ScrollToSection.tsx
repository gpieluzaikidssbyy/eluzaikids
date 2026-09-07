'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const VALID_SECTIONS = ['jadwal', 'event', 'kegiatan', 'lokasi', 'kontak'];

export function ScrollToSection() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const section = searchParams.get('scroll');
    if (!section || !VALID_SECTIONS.includes(section)) return;

    const scrollTo = () => {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const timer = window.setTimeout(scrollTo, 100);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return null;
}
