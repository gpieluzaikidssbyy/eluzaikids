import type { ElementType } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Ticket,
  ShoppingBag,
  Users,
  ClipboardList,
  CheckCircle2,
  Building,
  Settings,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/* ─── Navigation structure ─── */

export const navGroups: NavGroup[] = [
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

export const STANDALONE_ROUTES = ['/admin/login', '/admin/reset-password'];

/* ─── Sidebar sizing ─── */

export const SIDEBAR_COLLAPSED_W = 80;
export const SIDEBAR_EXPANDED_W = 280;

/* ─── Helpers ─── */

export function getPageTitle(pathname: string) {
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

export function activeMatch(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}