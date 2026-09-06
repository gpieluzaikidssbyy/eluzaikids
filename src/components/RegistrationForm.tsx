'use client';

import { useState, useRef, useEffect } from 'react';
import { registrationSchema } from '@/lib/validations';

interface RegistrationFormProps {
  registrableType: 'event' | 'activity';
  registrableId: number;
  registrableTitle: string;
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

export function RegistrationForm({
  registrableType,
  registrableId,
  registrableTitle,
  buttonClass = '',
}: RegistrationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && recaptchaRef.current && !recaptchaWidgetId.current) {
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
          theme: 'light',
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
    }
  }, [isOpen]);

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
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/register/${registrableType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          'g-recaptcha-response': captchaResponse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Terjadi kesalahan.' });
        }
        return;
      }

      setSuccess(true);
      setQrUrl(typeof data.qr_url === 'string' ? data.qr_url : '');
      setNomorRegistrasi(typeof data.nomor_registrasi === 'string' ? data.nomor_registrasi : '');
    } catch {
      setErrors({ general: 'Terjadi kesalahan saat mengirim data.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/30">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold text-green-800 dark:text-green-300">
          Pendaftaran Berhasil!
        </h3>
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          Terima kasih telah mendaftar untuk <strong>{registrableTitle}</strong>.
          {registrableType === 'event' ? ' cek email untuk QR Code.' : ' Silakan cek email untuk konfirmasi.'}
        </p>
        {qrUrl && (
          <div className="mt-4 rounded-xl border border-green-200 bg-white p-4 dark:border-green-900 dark:bg-slate-900">
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
          onClick={() => {
            setIsOpen(false);
            setSuccess(false);
            setQrUrl('');
            setNomorRegistrasi('');
          }}
          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`btn-primary ${buttonClass}`}
      >
        Daftar Sekarang
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                Formulir Pendaftaran
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Honeypot field */}
              <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
              </div>

              {errors.general && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field mt-1"
                  placeholder="Nama pendaftar"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="input-field mt-1"
                  placeholder="0812xxxxxxx"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="input-field mt-1"
                  placeholder="email@contoh.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Jumlah yang Hadir
                </label>
                <select name="jumlah_hadir" required className="input-field mt-1">
                  <option value="">Pilih jumlah</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} orang
                    </option>
                  ))}
                </select>
                {errors.jumlah_hadir && (
                  <p className="mt-1 text-xs text-red-500">{errors.jumlah_hadir}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="consent"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    Saya menyetujui data ini akan digunakan untuk keperluan pendaftaran
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-1 text-xs text-red-500">{errors.consent}</p>
                )}
              </div>

              {/* reCAPTCHA */}
              <div ref={recaptchaRef} className="flex justify-center" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
