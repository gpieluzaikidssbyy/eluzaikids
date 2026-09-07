'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ComponentProps } from 'react';

interface PreserveFromLinkProps extends ComponentProps<typeof Link> {
  href: string;
  section?: string;
}

export function PreserveFromLink({ href, section, ...rest }: PreserveFromLinkProps) {
  const searchParams = useSearchParams();
  const from = section ?? searchParams.get('from');
  const target = from
    ? `${href}${href.includes('?') ? '&' : '?'}from=${encodeURIComponent(from)}`
    : href;

  return <Link href={target} {...rest} />;
}