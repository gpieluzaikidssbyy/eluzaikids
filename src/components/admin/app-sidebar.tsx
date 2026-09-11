'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  navGroups,
  SIDEBAR_COLLAPSED_W,
  SIDEBAR_EXPANDED_W,
  activeMatch,
  type NavItem,
} from '@/components/admin/nav';

interface AppSidebarProps {
  sessionUsername: string;
  initials: string;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onLogout: () => void;
}

export function AppSidebar({
  sessionUsername,
  initials,
  mobileOpen,
  onMobileOpenChange,
  onLogout,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const hoveredRef = useRef(isHovered);
  const mobileOpenRef = useRef(mobileOpen);
  hoveredRef.current = isHovered;
  mobileOpenRef.current = mobileOpen;

  useEffect(() => {
    const aside = asideRef.current;
    const nav = navRef.current;
    if (!aside) return;
    const onWheel = (event: WheelEvent) => {
      if (!hoveredRef.current || mobileOpenRef.current) return;
      // Native scroll already handles wheel rolls that start inside the nav.
      if (nav && event.target instanceof Node && nav.contains(event.target)) return;
      event.preventDefault();
      if (!nav) return;
      const max = nav.scrollHeight - nav.clientHeight;
      if (max <= 0) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      nav.scrollTop = Math.min(Math.max(nav.scrollTop + delta, 0), max);
    };
    aside.addEventListener('wheel', onWheel, { passive: false });
    return () => aside.removeEventListener('wheel', onWheel);
  }, []);

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
        onClick={() => onMobileOpenChange(false)}
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
    <div className="flex h-full min-h-0 flex-col">
      {/* ─── Nav ─── */}
      <nav ref={navRef} className={cn('min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin transition-all duration-300', expanded ? 'space-y-5 px-3 py-5' : 'space-y-4 px-2 py-4')}>
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
            onClick={onLogout}
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
    <aside
      ref={asideRef}
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
  );
}