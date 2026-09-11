import { headers } from 'next/headers';
import AdminShell from './admin-shell';

/**
 * Root of the /admin segment. Reads `headers()` as a side-effect so every
 * admin route is rendered on-demand instead of being statically prerendered.
 *
 * Why this matters: the CSP nonce lives in the `Content-Security-Policy`
 * request header injected by middleware.ts. Next.js only stamps its inline
 * `self.__next_f` hydration scripts with that nonce when the page is rendered
 * per-request (dynamic). Statically prerendered pages are generated at build
 * time, before any request headers exist, so their inline scripts ship without
 * a nonce while the response CSP demands `'nonce-...'` — the browser then
 * blocks every inline script and the client-side admin UI never boots (blank
 * page in production).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  headers();
  return <AdminShell>{children}</AdminShell>;
}