/**
 * HTML-escape a value for safe embedding in server-rendered HTML.
 * Shared by all routes/templates that render untrusted user output.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strip control characters, quotes and path/header-breaking chars from a
 * Content-Disposition filename (the title may include an admin-supplied value).
 */
export function safeFilename(value: string): string {
  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/["]/g, ' ')
    .replace(/[<>:"/\\|?*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}