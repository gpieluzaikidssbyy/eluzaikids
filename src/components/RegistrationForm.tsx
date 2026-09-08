'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const stagger = (delay: number) => ({ animationDelay: `${delay}ms` });

const inputClass =
  'mt-2 h-12 w-full rounded-xl border border-white/70 bg-white/45 px-4 text-base text-slate-900 outline-none shadow-inner shadow-white/30 backdrop-blur-md transition-all duration-300 placeholder:text-slate-400 hover:bg-white/60 focus:-translate-y-0.5 focus:border-brand-400 focus:bg-white/70 focus:ring-4 focus:ring-brand-500/15 dark:border-white/15 dark:bg-white/10 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:bg-white/15 dark:focus:bg-white/15 sm:text-sm';

export function RegistrationForm({
  registrableType,
  registrableId,
  registrableTitle,
  emailEnabled = true,
  buttonClass = '',
}: RegistrationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [confirmationEmailEnabled, setConfirmationEmailEnabled] = useState(emailEnabled);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);
  const router = useRouter();

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
    router.push('/');
  };

  if (success) {
    return (
      <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-800">
        {/* Stamp-style badge */}
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute -inset-1.5 rounded-full border-2 border-dashed border-brand-300 dark:border-brand-500/40" />
          <div className="animate-pop relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-blue-600 shadow-lg shadow-brand-500/30">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          SUCCESS!
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {confirmationEmailEnabled
            ? 'Registration successful! Please check your email.'
            : 'Registration successful!'}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {registrableTitle}
        </p>
        {qrUrl && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              QR Code Presensi
            </p>
            {nomorRegistrasi && (
              <p className="mt-1 font-mono text-xs font-semibold text-brand-600">{nomorRegistrasi}</p>
            )}
            <img
              src={qrUrl}
              alt="QR Code Presensi"
              className="mx-auto mt-3 h-44 w-44 border border-slate-200 p-2 dark:border-slate-700"
            />
            <p className="mt-2 text-xs text-slate-500">
              Simpan atau tunjukkan barcode ini saat presensi di lokasi.
            </p>
          </div>
        )}
        <button
          onClick={handleBackHome}
          className="mt-5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700"
        >
          Back to Home Page
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/35 focus:outline-none focus:ring-2 focus:ring-brand-500/40 active:translate-y-0 active:scale-95 ${buttonClass}`}
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-shimmer motion-reduce:animate-none" />
        <span className="relative">Daftar</span>
      </button>

      {isOpen && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-slate-950/55 p-0 backdrop-blur-xl sm:items-center sm:p-4 motion-reduce:animate-none">
          <div className="animate-sheet-up sm:animate-scale-in my-0 flex max-h-[calc(100dvh-0.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] rounded-b-none border border-white/60 bg-white/35 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl dark:border-white/15 dark:bg-slate-900/45 sm:my-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem] motion-reduce:animate-none">
            <div className="relative shrink-0 overflow-hidden border-b border-white/15 bg-gradient-to-br from-brand-600 via-brand-700 to-blue-700 px-5 py-5 text-white dark:from-navy-900 dark:via-brand-900 dark:to-navy-950 sm:px-6 sm:py-7">
              <div className="animate-float pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-cyan-300/30 blur-2xl" />
              <div className="animate-float pointer-events-none absolute -bottom-20 left-16 h-36 w-36 rounded-full bg-blue-300/30 blur-2xl [animation-delay:-3.5s]" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="animate-fade-in-up">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm sm:mb-4 sm:h-11 sm:w-11">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m6-8a4 4 0 100-8 4 4 0 000 8zm8-3v6m3-3h-6" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                    Pendaftaran online
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold tracking-tight sm:text-2xl">
                    Formulir Pendaftaran
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-blue-100 sm:mt-2 sm:text-sm">
                    {registrableTitle}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup formulir"
                  className="relative shrink-0 rounded-full border border-white/25 bg-white/10 p-2 text-white/80 transition-all duration-300 hover:rotate-90 hover:bg-white/25 hover:text-white active:scale-90"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-y-auto bg-white/20 px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:space-y-5 sm:p-7 dark:bg-slate-950/20">
              {/* Honeypot field */}
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
              </div>

              {errors.general && (
                <div className="animate-fade-in-down rounded-2xl border border-red-200/70 bg-red-50/65 px-4 py-3 text-sm text-red-600 backdrop-blur-md dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-300">
                  {errors.general}
                </div>
              )}

              <div className="animate-fade-in-up" style={stagger(40)}>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className={inputClass}
                  placeholder="Nama pendaftar"
                />
                {errors.name && (
                  <p className="animate-fade-in-down mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="animate-fade-in-up" style={stagger(100)}>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Nomor HP <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className={inputClass}
                  placeholder="0812xxxxxxx"
                />
                {errors.phone && (
                  <p className="animate-fade-in-down mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="animate-fade-in-up" style={stagger(160)}>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className={inputClass}
                  placeholder="email@contoh.com"
                />
                {errors.email && (
                  <p className="animate-fade-in-down mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="animate-fade-in-up" style={stagger(220)}>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Jumlah yang Hadir <span className="text-red-500">*</span>
                </label>
                <select name="jumlah_hadir" required className={inputClass}>
                  <option value="">Pilih jumlah</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} orang
                    </option>
                  ))}
                </select>
                {errors.jumlah_hadir && (
                  <p className="animate-fade-in-down mt-1 text-xs text-red-500">{errors.jumlah_hadir}</p>
                )}
              </div>

              <div
                className="animate-fade-in-up rounded-2xl border border-white/60 bg-white/35 p-4 shadow-inner shadow-white/20 backdrop-blur-md dark:border-white/10 dark:bg-white/10"
                style={stagger(280)}
              >
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="consent"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Saya menyetujui data ini akan digunakan untuk keperluan pendaftaran{' '}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.consent && (
                  <p className="animate-fade-in-down mt-1 text-xs text-red-500">{errors.consent}</p>
                )}
              </div>

              {/* reCAPTCHA */}
              <div ref={recaptchaRef} className="animate-fade-in-up flex justify-center" style={stagger(340)} />

              <div className="animate-fade-in-up" style={stagger(400)}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative min-h-12 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand-500/40 focus:outline-none focus:ring-4 focus:ring-brand-500/30 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-xl"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-shimmer motion-reduce:animate-none" />
                  <span className="relative">{isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}