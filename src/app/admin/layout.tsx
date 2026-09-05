'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: 'grid' },
  { href: '/admin/schedules', label: 'Schedule', icon: 'clock' },
  { href: '/admin/church-info', label: 'Church Info', icon: 'building' },
];

const groupedLinks = {
  event: [
    { href: '/admin/events', label: 'Manage Event' },
    { href: '/admin/registrants/events', label: 'Manage Registrants' },
    { href: '/admin/presensi/events', label: 'Event Attendance' },
  ],
  activity: [
    { href: '/admin/activities', label: 'Manage Activity' },
    { href: '/admin/registrants/activities', label: 'Manage Registrants' },
    { href: '/admin/presensi/activities', label: 'Activity Attendance' },
  ],
  members: [
    { href: '/admin/members', label: 'Manage Members' },
    { href: '/admin/members/attendance', label: 'Members Attendance' },
    { href: '/admin/members/manage-attendance', label: 'Manage Attendance' },
  ],
};

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M8 10h8M8 14h6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <><path d="M20 6 9 17l-5-5" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    building: <><path d="M3 21h18M5 21V5l7-3 7 3v16M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1" /></>,
  };

  return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expanded, setExpanded] = useState({ event: false, activity: false, members: false });
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionUsername, setSessionUsername] = useState('');

  useEffect(() => {
    if (pathname === '/admin/login' || pathname === '/admin/reset-password') { setAuthLoading(false); return; }
    fetch('/api/auth/session').then((response) => response.json()).then((data) => {
      if (!data.authenticated) router.replace('/admin/login');
      else {
        setSessionUsername(data.user?.username || data.user?.name || 'Admin');
        setAuthLoading(false);
      }
    });
  }, [pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
    setExpanded({
      event: pathname.startsWith('/admin/events') || pathname.startsWith('/admin/registrants/events') || pathname.startsWith('/admin/presensi/events'),
      activity: pathname.startsWith('/admin/activities') || pathname.startsWith('/admin/registrants/activities') || pathname.startsWith('/admin/presensi/activities'),
      members: pathname.startsWith('/admin/members'),
    });
  }, [pathname]);

  if (pathname === '/admin/login' || pathname === '/admin/reset-password') return <>{children}</>;
  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#f7f8fa] dark:bg-slate-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,18rem)] max-w-[18rem] transform border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:w-64 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi admin"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-700 lg:hidden">
          <div className="flex items-center gap-2 font-display font-bold text-slate-900 dark:text-white"><img src="/images/logo-placeholder.webp" alt="GPI Eluzai Kids" className="h-9 w-9 object-contain" />{sessionUsername}</div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="hidden border-b border-slate-100 px-5 py-5 lg:block dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img src="/images/logo-placeholder.webp" alt="GPI Eluzai Kids" className="h-10 w-10 object-contain" />
            <div><p className="font-display text-sm font-bold text-slate-900 dark:text-white">Eluzai Kids</p><p className="text-xs text-slate-400">Selamat datang kembali, {sessionUsername} 👋</p></div>
          </div>
        </div>
        <nav className="flex max-h-[calc(100vh-5rem)] flex-col gap-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Main menu</p>
          {sidebarLinks.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                (pathname === link.href || (link.href !== '/admin' && pathname.startsWith(`${link.href}/`)))
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className={pathname === link.href ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}><NavIcon name={link.icon} /></span>
              {link.label}
            </Link>
          ))}
          {(['event', 'activity', 'members'] as const).map((group) => (
            <div key={group}>
              <div className={`flex items-center rounded-lg text-sm font-medium transition ${
                expanded[group] ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Link
                  href={groupedLinks[group][0].href}
                  onClick={() => {
                    setExpanded((current) => ({ ...current, [group]: true }));
                    setSidebarOpen(false);
                  }}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg px-3 py-2.5 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/70"
                >
                  <span className={expanded[group] ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}><NavIcon name={group === 'event' ? 'calendar' : 'clipboard'} /></span>
                  <span>{group === 'event' ? 'Event' : group === 'activity' ? 'Activity' : 'Members'}</span>
                </Link>
                <button
                  type="button"
                  aria-label={`Toggle ${group} submenu`}
                  onClick={() => setExpanded((current) => ({ ...current, [group]: !current[group] }))}
                  className="rounded-r-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <svg className={`h-4 w-4 transition-transform ${expanded[group] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </div>
              {expanded[group] && (
                <div className="ml-5 border-l border-slate-200 py-1 pl-3 dark:border-slate-700">
                  {groupedLinks[group].map((link) => {
                    const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`block rounded-md px-3 py-2 text-sm transition ${
                          active ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {sidebarLinks.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === link.href || pathname.startsWith(`${link.href}/`)
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="text-slate-400"><NavIcon name={link.icon} /></span>
              {link.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-brand-400"
            >
              <span>View site</span>
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>
            </Link>
          </div>
          <div className="mt-2 border-t border-slate-200 pt-3 dark:border-slate-700">
            <Link
              href="/admin/settings"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-brand-400"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              Settings
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu admin"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/images/logo-placeholder.webp" alt="GPI Eluzai Kids" className="h-8 w-8 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">GPI Eluzai Kids</p>
            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{sessionUsername}</p>
          </div>
        </div>

        {pathname === '/admin' && (
          <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <img src="/images/logo-placeholder.webp" alt="GPI Eluzai Kids" className="h-9 w-9 object-contain" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">GPI Eluzai Kids</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-200">Admin Panel</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
