'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAdminTheme as useTheme } from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  ClipboardList,
  Users,
  Clock,
  Building,
  Settings,
  Menu,
  Sun,
  Moon,
  Loader2,
  LogOut,
  ExternalLink,
  CheckCircle2,
  ShoppingBag,
  UserCircle,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';

/* ─── Navigation structure ─── */

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Main Menu',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays, badge: 'New' },
      { href: '/admin/schedules', label: 'Schedule', icon: Clock },
    ],
  },
  {
    label: 'Events',
    items: [
      { href: '/admin/events', label: 'Manage Event', icon: Ticket },
      { href: '/admin/registrants/events', label: 'Event Registrants', icon: ShoppingBag },
      { href: '/admin/presensi/events', label: 'Event Attendance', icon: Users },
    ],
  },
  {
    label: 'Kegiatan',
    items: [
      { href: '/admin/activities', label: 'Manage Activity', icon: ClipboardList },
      { href: '/admin/registrants/activities', label: 'Activity Registrants', icon: ShoppingBag },
      { href: '/admin/presensi/activities', label: 'Activity Attendance', icon: Users },
    ],
  },
  {
    label: 'Childs',
    items: [
      { href: '/admin/members', label: 'Manage Childs', icon: Users },
      { href: '/admin/members/attendance', label: 'Childs Attendance', icon: CheckCircle2 },
      { href: '/admin/members/manage-attendance', label: 'Manage Attendance', icon: Users },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { href: '/admin/church-info', label: 'Church Info', icon: Building },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

/* ─── Standalone routes (rendered without the shell) ─── */

const STANDALONE_ROUTES = ['/admin/login', '/admin/reset-password'];

/* ─── Sidebar sizing ─── */

const SIDEBAR_COLLAPSED_W = 80;
const SIDEBAR_EXPANDED_W = 280;

/* ─── Helpers ─── */

function getPageTitle(pathname: string) {
  if (pathname === '/admin') return 'Dashboard';
  if (pathname.startsWith('/admin/calendar')) return 'Calendar';
  if (pathname.startsWith('/admin/events')) return 'Event';
  if (pathname.startsWith('/admin/activities')) return 'Kegiatan';
  if (pathname.startsWith('/admin/registrants/events')) return 'Pendaftar Event';
  if (pathname.startsWith('/admin/registrants/activities')) return 'Pendaftar Kegiatan';
  if (pathname.startsWith('/admin/presensi')) return 'Presensi';
  if (pathname.startsWith('/admin/members')) return 'Childs';
  if (pathname.startsWith('/admin/schedules')) return 'Schedule';
  if (pathname.startsWith('/admin/church-info')) return 'Church Info';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  return 'Admin';
}

function activeMatch(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ─── Layout ─── */

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionUsername, setSessionUsername] = useState('');

  /* Auth */
  useEffect(() => {
    if (STANDALONE_ROUTES.includes(pathname)) {
      setAuthLoading(false);
      return;
    }
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) router.replace('/admin/login');
        else {
          setSessionUsername(data.user?.username || data.user?.name || 'Admin');
          setAuthLoading(false);
        }
      });
  }, [pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  /* Early returns for standalone routes */
  if (STANDALONE_ROUTES.includes(pathname)) {
    return (
      <>
        <Toaster />
        {children}
      </>
    );
  }

  if (authLoading) {
    return (
      <div className="font-admin-scope flex min-h-screen flex-col items-center justify-center gap-5 bg-background text-muted-foreground">
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/20" />
          <img src="/images/logo.webp" alt="GPI Eluzai Kids" className="h-16 w-16 rounded-xl object-contain" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  const initials = sessionUsername
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  /* Hover state: mobile drawer always renders expanded */
  const expanded = mobileOpen || isHovered;
  const sidebarW = expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;

  /* Active item: only the most specific (longest) matching route gets highlighted */
  let activeHref = pathname === '/admin' ? '/admin' : '';
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === '/admin') continue;
      if (activeMatch(pathname, item.href) && item.href.length > activeHref.length) {
        activeHref = item.href;
      }
    }
  }

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = item.href === '/admin' ? pathname === '/admin' : item.href === activeHref;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        title={!expanded ? item.label : undefined}
        className={cn(
          'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150',
          expanded ? 'px-3 py-2.5' : 'justify-center px-0 py-2.5',
          isActive
            ? 'bg-[#ECF3FF] text-primary dark:bg-primary/15 dark:text-white'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0 transition-colors', isActive ? 'text-primary dark:text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300')} />
        <span
          className={cn(
            'min-w-0 truncate whitespace-nowrap transition-all duration-200',
            expanded ? 'w-auto flex-1 opacity-100' : 'w-0 flex-none overflow-hidden opacity-0'
          )}
        >
          {item.label}
        </span>
        {item.badge && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all duration-200',
              expanded ? 'opacity-100' : 'pointer-events-none absolute right-1 top-1 h-0 w-0 overflow-hidden p-0 opacity-0',
              isActive
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderGroupLabel = (label: string) => (
    <p
      className={cn(
        'px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500 transition-all duration-200',
        expanded ? 'mb-2 h-auto opacity-100' : 'mb-0 h-0 overflow-hidden opacity-0'
      )}
    >
      {label}
    </p>
  );

  const SidebarContent = (
    <div className="flex h-full flex-col">
      {/* ─── Nav ─── */}
      <nav className={cn('flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin transition-all duration-300', expanded ? 'space-y-5 px-3 py-5' : 'space-y-4 px-2 py-4')}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {renderGroupLabel(group.label)}
            <div className="space-y-0.5">
              {group.items.map((item) => renderNavItem(item))}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Bottom user card ─── */}
      <div className="shrink-0 border-t border-border p-3">
        <div
          className={cn(
            'flex items-center rounded-lg bg-slate-50 transition-all duration-300 dark:bg-slate-800/60',
            expanded ? 'gap-3 p-3' : 'justify-center p-2'
          )}
        >
          <Avatar className={cn('shrink-0 ring-2 ring-primary/20', expanded ? 'h-10 w-10' : 'h-9 w-9')}>
            <AvatarImage src="/images/logo.webp" alt={sessionUsername} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className={cn('min-w-0 transition-all duration-300', expanded ? 'w-auto flex-1 opacity-100' : 'w-0 flex-none overflow-hidden opacity-0')}>
            <p className="truncate text-sm font-semibold text-foreground">{sessionUsername}</p>
            <p className="text-[11px] text-muted-foreground">Administrator</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Keluar"
            className={cn(
              'shrink-0 rounded-lg p-2 text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive',
              expanded ? 'opacity-100' : 'pointer-events-none h-0 w-0 overflow-hidden p-0 opacity-0'
            )}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-admin-scope flex min-h-screen bg-background">
      <Toaster />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-md [backdrop-filter:blur(10px)] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar (hover-expandable on desktop, drawer on mobile) ─── */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'flex shrink-0 flex-col border-r border-border bg-card',
          'fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: mobileOpen ? SIDEBAR_EXPANDED_W : sidebarW, transitionProperty: 'width, transform' }}
        aria-label="Navigasi admin"
      >
        {SidebarContent}
      </aside>

      {/* ─── Main column ─── */}
      <div className="min-w-0 flex-1">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Eluzai Kids · Admin</p>
            <h2 className="truncate font-display text-sm font-bold text-foreground">{getPageTitle(pathname)}</h2>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ganti tema"
            className="rounded-lg p-2 text-muted-foreground transition-all hover:rotate-12 hover:bg-muted hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src="/images/logo.webp" alt={sessionUsername} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground sm:block">
                  {sessionUsername}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{sessionUsername}</span>
                <span className="text-xs font-normal text-muted-foreground">Administrator</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <UserCircle className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" target="_blank" className="cursor-pointer">
                  <ExternalLink className="h-4 w-4" />
                  Lihat situs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <div className="relative">
          <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}