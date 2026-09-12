/**
 * Get week day names in Indonesian.
 */
export const WEEKDAYS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
] as const;

/**
 * Member classes.
 */
export const MEMBER_CLASSES = ['Baby', 'Samuel', 'Yosua', 'Musa'] as const;

/**
 * Month names in Indonesian.
 */
export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

/**
 * Day names in Indonesian ordered from Sunday, matching Date#getDay().
 */
export const DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

/**
 * Shared Tailwind style tokens per member class.
 * The three member admin pages each use a subset of these keys.
 */
export const CLASS_STYLES: Record<
  string,
  { active: string; badge: string; badgeText: string; bar: string; gradient: string; hover: string; icon: string }
> = {
  Baby: {
    active: 'border-pink-400 bg-pink-50 dark:bg-pink-950/30',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300',
    badgeText: 'text-pink-700 dark:text-pink-300',
    bar: 'from-pink-400 to-rose-500',
    gradient: 'from-pink-500 to-rose-600',
    hover: 'hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30',
    icon: 'bg-pink-100 text-pink-600 dark:bg-pink-950/40',
  },
  Samuel: {
    active: 'border-sky-400 bg-sky-50 dark:bg-sky-950/30',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    badgeText: 'text-sky-700 dark:text-sky-300',
    bar: 'from-sky-400 to-blue-500',
    gradient: 'from-sky-500 to-blue-600',
    hover: 'hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30',
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40',
  },
  Yosua: {
    active: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    bar: 'from-emerald-400 to-teal-500',
    gradient: 'from-emerald-500 to-teal-600',
    hover: 'hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40',
  },
  Musa: {
    active: 'border-violet-400 bg-violet-50 dark:bg-violet-950/30',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    badgeText: 'text-violet-700 dark:text-violet-300',
    bar: 'from-violet-400 to-purple-500',
    gradient: 'from-violet-500 to-purple-600',
    hover: 'hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30',
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40',
  },
};
