'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      render?: (container: string | HTMLElement, options: Record<string, unknown>) => number;
      reset?: (widgetId?: number) => void;
      ready?: (callback: () => void) => void;
    };
  }
}

/**
 * Load reCAPTCHA v2 (explicit render) lazily when `enabled` becomes true and
 * reset it when the host modal closes, so the widget re-renders on next open.
 */
export function useRecaptchaV2(
  enabled: boolean,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaWidgetId = useRef<number | null>(null);

  useEffect(() => {
    // Reset widget state when the modal closes so it re-renders on next open.
    if (!enabled) {
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
  }, [enabled, setErrors]);

  return { recaptchaReady, recaptchaRef };
}