'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { registrationSchema } from '@/lib/validations';

interface RegistrationFormProps {
  registrableType: 'event' | 'activity';
  registrableId: number;
  registrableTitle: string;
  emailEnabled?: boolean;
  buttonClass?: string;
}

declare global {
  interface Window {
    grecaptcha: {
      render?: (container: string | HTMLElement, options: Record<string, unknown>) => number;
      reset?: (widgetId?: number) => void;
      ready?: (callback: () => void) => void;
    };
  }
}

const inputClass =
  'mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-brand-500 sm:text-sm';

const labelClass =
  'block text-sm font-medium text-slate-700 dark:text-slate-300';

const errorClass =
  'animate-fade-in-down mt-1.5 text-xs text-red-600 dark:text-red-400';

export function RegistrationForm({
  registrableType,
  registrableId,
  registrableTitle,
  emailEnabled = true,
  buttonClass = '',
}: RegistrationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [confirmationEmailEnabled, setConfirmationEmailEnabled] = useState(emailEnabled);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const originalHtmlOverflow = htmlEl.style.overflow;
    const originalBodyOverflow = bodyEl.style.overflow;
    htmlEl.style.overflow = 'hidden';
    bodyEl.style.overflow = 'hidden';

    // Pause Lenis (smooth scroll) so wheel/trackpad events no longer scroll the
    // underlying page; the modal content scrolls independently inside the portal.
    const lenis = window.__lenis;
    const lenisPaused = lenis?.isStopped === true;
    lenis?.stop();

    // Block wheel/touch scrolling that does not originate inside the scrollable
    // modal content, so trackpad scrolls only the form and not the page behind.
    const isInsideModal = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node) || !modalRef.current) return false;
      return modalRef.current.contains(target);
    };

    const preventBackgroundScroll = (e: WheelEvent) => {
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    const preventBackgroundTouch = (e: TouchEvent) => {
      if (!isInsideModal(e.target)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventBackgroundScroll, { passive: false });
    window.addEventListener('touchmove', preventBackgroundTouch, { passive: false });

    return () => {
      htmlEl.style.overflow = originalHtmlOverflow;
      bodyEl.style.overflow = originalBodyOverflow;
      if (lenis && !lenisPaused) lenis.start();
      window.removeEventListener('wheel', preventBackgroundScroll);
      window.removeEventListener('touchmove', preventBackgroundTouch);
    };
  }, [isOpen]);

  useEffect(() => {
    // Reset widget state when the modal closes so it re-renders on next open.
    if (!isOpen) {
      recaptchaWidgetId.current = null;
      setRecaptchaReady(false);
      return;
    }

    if (!recaptchaRef.current || recaptchaWidgetId.current) return;

    // Load reCAPTCHA script
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-recaptcha-v2]');
    const script = existingScript || document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.setAttribute('data-recaptcha-v2', 'true');
    script.async = true;
    const initialize = () => {
      const grecaptcha = window.grecaptcha;
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      if (!grecaptcha || !siteKey) return;

      if (typeof grecaptcha.render !== 'function' || !recaptchaRef.current) {
        setErrors({ general: 'reCAPTCHA v2 gagal dimuat. Silakan refresh halaman.' });
        return;
      }
      recaptchaWidgetId.current = grecaptcha.render(recaptchaRef.current, {
        sitekey: siteKey,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        callback: () => setRecaptchaReady(true),
        'expired-callback': () => setRecaptchaReady(false),
        'error-callback': () => {
          setRecaptchaReady(false);
          setErrors({ general: 'reCAPTCHA gagal dimuat. Silakan coba lagi.' });
        },
      });
    };

    if (existingScript && window.grecaptcha) {
      if (window.grecaptcha.ready) window.grecaptcha.ready(initialize);
      else initialize();
    } else {
      script.onload = () => {
        if (window.grecaptcha?.ready) window.grecaptcha.ready(initialize);
        else initialize();
      };
      if (!existingScript) document.head.appendChild(script);
    }
  }, [isOpen]);

  // Map reCAPTCHA errors (no visible field) to the general message so users see them.
  // Helper function to get CSRF token from API endpoint
  // Cookie eluzai_csrf_token adalah HTTP-only sehingga tidak bisa diakses oleh JavaScript.
  // Sebagai gantinya, kita menggunakan endpoint /api/csrf-token untuk mendapatkan token.
  let csrfToken: string | null = null;

  const fetchCsrfToken = async (): Promise<void> => {
    try {
      const response = await fetch('/api/csrf-token');
      const data = await response.json();
      if (data.token) {
        csrfToken = data.token;
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  };

  const normalizeErrors = (raw: Record<string, string>): Record<string, string> => {
    const next: Record<string, string> = { ...raw };
    const captchaMsg = next['g-recaptcha-response'];
    if (captchaMsg) {
      delete next['g-recaptcha-response'];
      next.general = captchaMsg;
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      jumlah_hadir: formData.get('jumlah_hadir'),
      consent: formData.get('consent') === 'on',
      honeypot: formData.get('honeypot'),
      id: registrableId,
    };

    try {
      const captchaResponse = formData.get('g-recaptcha-response');
      if (!recaptchaReady || typeof captchaResponse !== 'string' || !captchaResponse) {
        setErrors({ general: 'Centang reCAPTCHA terlebih dahulu.' });
        setIsSubmitting(false);
        return;
      }

      const validation = registrationSchema.safeParse({
        ...payload,
        'g-recaptcha-response': captchaResponse,
      });
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const field = issue.path.join('.');
          if (!fieldErrors[field]) fieldErrors[field] = issue.message;
        });
        setErrors(normalizeErrors(fieldErrors));
        setIsSubmitting(false);
        return;
      }

      // Get CSRF token from API endpoint and include in request
      // Jika csrfToken belum di-fetch, kita fetch sekarang
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }

      const response = await fetch(`/api/register/${registrableType}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...payload,
          'g-recaptcha-response': captchaResponse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(normalizeErrors(data.errors));
        } else {
          setErrors({ general: data.message || 'Terjadi kesalahan.' });
        }
        return;
      }

      setSuccess(true);
      setQrUrl(typeof data.qr_url === 'string' ? data.qr_url : '');
      setNomorRegistrasi(typeof data.nomor_registrasi === 'string' ? data.nomor_registrasi : '');
      setConfirmationEmailEnabled(data.email_enabled !== false);
    } catch {
      setErrors({ general: 'Terjadi kesalahan saat mengirim data.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackHome = () => {
    setIsOpen(false);
    setSuccess(false);
    setQrUrl('');
    setNomorRegistrasi('');
    setConfirmationEmailEnabled(emailEnabled);
  };

  const downloadQrTicket = async () => {
    if (!qrUrl || !nomorRegistrasi || isDownloading) return;
    setIsDownloading(true);
    try {
      const qrImg = new Image();
      qrImg.src = qrUrl;
      await qrImg.decode();

      const W = 600;
      const H = 820;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      const centerText = (
        text: string,
        y: number,
        font: string,
        color: string,
        maxWidth = W - 120
      ) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let shown = text;
        if (ctx.measureText(shown).width > maxWidth) {
          while (ctx.measureText(`${shown}…`).width > maxWidth && shown.length > 0) {
            shown = shown.slice(0, -1);
          }
          shown = `${shown}…`;
        }
        ctx.fillText(shown, W / 2, y, maxWidth);
      };

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, W, H);

      roundRect(24, 24, W - 48, H - 48, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();

      const mono = '"JetBrains Mono", ui-monospace, Consolas, monospace';

      centerText('GPI ELUZAI KIDS', 96, '800 22px Inter, system-ui, sans-serif', '#7c3aed');
      centerText('QR CODE PRESENSI', 140, '800 36px Inter, system-ui, sans-serif', '#0f172a');
      centerText(registrableTitle, 172, '600 20px Inter, system-ui, sans-serif', '#64748b');

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 206);
      ctx.lineTo(W - 80, 206);
      ctx.stroke();

      const qrSize = 320;
      const qrX = (W - qrSize) / 2;
      const qrY = 232;
      ctx.fillStyle = '#ffffff';
      roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      centerText('NO. REGISTRASI', 612, '700 18px Inter, system-ui, sans-serif', '#475569');

      let numSize = 44;
      const setNumFont = () => {
        ctx.font = `800 ${numSize}px ${mono}`;
      };
      setNumFont();
      while (ctx.measureText(nomorRegistrasi).width > W - 120 && numSize > 24) {
        numSize -= 2;
        setNumFont();
      }
      centerText(nomorRegistrasi, 668, `800 ${numSize}px ${mono}`, '#7c3aed');

      centerText('Simpan gambar ini sebagai bukti pendaftaran.', 748, '500 16px Inter, system-ui, sans-serif', '#94a3b8');

      const link = document.createElement('a');
      link.download = `qr-presensi-${nomorRegistrasi}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate QR ticket:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40 active:scale-[0.98] ${buttonClass}`}
      >
        Daftar
      </button>

      {isOpen &&
        createPortal(
        <div ref={modalRef} className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <div className="animate-sheet-up sm:animate-scale-in flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-h-[90dvh] sm:max-w-md sm:rounded-2xl dark:bg-slate-900">
            {success ? (
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-8" data-lenis-prevent>
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                    <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Pendaftaran Berhasil
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {confirmationEmailEnabled
                      ? 'Pendaftaran berhasil. Silakan cek email Anda untuk konfirmasi.'
                      : 'Pendaftaran Anda telah diterima.'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {registrableTitle}
                  </p>

                  {qrUrl && (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        QR Code Presensi
                      </p>
                      {nomorRegistrasi && (
                        <p className="mt-2 font-mono text-base font-bold text-brand-600 dark:text-brand-400">
                          {nomorRegistrasi}
                        </p>
                      )}
                      <img
                        src={qrUrl}
                        alt="QR Code Presensi"
                        className="mx-auto mt-4 h-48 w-48 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-600"
                      />
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Simpan dan tunjukkan kode ini saat tiba di lokasi.
                      </p>
                    </div>
                  )}

                  {qrUrl && nomorRegistrasi && (
                    <button
                      onClick={() => void downloadQrTicket()}
                      disabled={isDownloading}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 19h16" />
                      </svg>
                      {isDownloading ? 'Menyiapkan...' : 'Download QR Code Presensi'}
                    </button>
                  )}

                  <button
                    onClick={handleBackHome}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative shrink-0 border-b border-slate-200 px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6m-3-3v3m-9 3h18V9l-9-6-9 6v11z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
                          Formulir Pendaftaran
                        </h3>
                        <p className="truncate text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                          {registrableTitle}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      aria-label="Tutup formulir"
                      className="shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:space-y-5 sm:px-6"
                  data-lenis-prevent
                >
                  {/* Honeypot field */}
                  <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                    <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
                  </div>

                  {errors.general && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-400">
                      {errors.general}
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className={inputClass}
                      placeholder="Nama Lengkap Anak"
                    />
                    {errors.name && <p className={errorClass}>{errors.name}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Nomor HP Aktif <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      inputMode="tel"
                      required
                      className={inputClass}
                      placeholder="0812xxxxxxx"
                    />
                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Email Aktif <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      inputMode="email"
                      required
                      className={inputClass}
                      placeholder="email@contoh.com"
                    />
                    {errors.email && <p className={errorClass}>{errors.email}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Jumlah yang akan hadir (termasuk anak)<span className="text-red-500">*</span>
                    </label>
                    <select name="jumlah_hadir" required defaultValue="" className={inputClass}>
                      <option value="" disabled>
                        Pilih jumlah
                      </option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n} orang
                        </option>
                      ))}
                    </select>
                    {errors.jumlah_hadir && <p className={errorClass}>{errors.jumlah_hadir}</p>}
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 dark:border-slate-700 dark:bg-slate-800">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-500"
                    />
                    <label className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      Saya menyetujui data ini akan digunakan untuk keperluan pendaftaran{' '}
                      <span className="text-red-500">*</span>
                    </label>
                  </div>
                  {errors.consent && <p className={errorClass}>{errors.consent}</p>}

                  {/* reCAPTCHA */}
                  <div ref={recaptchaRef} className="flex justify-center" />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-500"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}