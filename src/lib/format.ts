/**
 * Base URL of the app without any trailing slash.
 * Guards against double slashes when env value ends with '/'.
 */
export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/+$/, '');
}

/**
 * Format date to Indonesian locale.
 */
export function formatDateIndo(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time to WIB (HH:MM WIB, without seconds).
 */
export function formatTimeWib(time: string): string {
  return `${time.slice(0, 5)} WIB`;
}

/**
 * Check if an event/activity date has fully passed (after 23:59:59 of that day).
 * Event pada hari-H dianggap belum selesai sampai tengah malam.
 */
export function isDatePassed(date: string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(`${date.slice(0, 10)}T23:59:59`);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

/**
 * Check if registration is still open.
 * Default deadline is H-2 from event/activity date.
 */
export function isRegistrationOpen(
  eventDate: string,
  registrationDeadline?: string | null
): boolean {
  const deadline = registrationDeadline
    ? new Date(registrationDeadline)
    : new Date(new Date(eventDate).getTime() - 2 * 24 * 60 * 60 * 1000);

  return new Date() <= deadline;
}

/**
 * Calculate remaining quota.
 */
export function remainingQuota(
  quota: number | null,
  registered: number
): number | null {
  if (quota === null) return null;
  return Math.max(0, quota - registered);
}

/**
 * Get Google Maps search link from location text.
 */
export function getMapsLink(location: string | null): string | null {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

/**
 * Build initials from a display name (max 2 letters, uppercase).
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}
