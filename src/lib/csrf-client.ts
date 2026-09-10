/**
 * Fetch a CSRF token from /api/csrf-token.
 *
 * Cookie eluzai_csrf_token adalah HTTP-only sehingga tidak bisa diakses oleh
 * JavaScript. Sebagai gantinya, client mengambil token dari endpoint ini.
 * Mengembalikan null jika token tidak tersedia atau permintaan gagal.
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return typeof data.token === 'string' ? data.token : null;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
}