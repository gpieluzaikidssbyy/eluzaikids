'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';

export default function ScanQrPage() {
  const params = useParams();
  const { type, id } = params;
  const [loading, setLoading] = useState(true);
  const [scanActive, setScanActive] = useState(true);
  const [eventTitle, setEventTitle] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; jumlah_hadir?: number } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/scan-qr/${type}/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: '' }),
      });
      const data = await response.json();
      setScanActive(response.status !== 403);
      setEventTitle(data.title || '');
      if (response.status === 403) setIsAuthorized(false);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => { void checkStatus(); }, [checkStatus]);

  const handleScan = useCallback(async (qrData: string) => {
    try {
      const response = await fetch(`/api/scan-qr/${type}/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData }),
      });

      const data = await response.json();
      setScanResult(data);

      if (data.success) {
        setTimeout(() => setScanResult(null), 3000);
      }
    } catch {
      setScanResult({ success: false, message: 'Gagal memverifikasi QR code.' });
    }
  }, [type, id]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    try {
      const response = await fetch(`/api/scan-qr/${type}/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();
      if (data.success) {
        setIsAuthorized(true);
      } else {
        setPinError(data.message || 'PIN salah.');
        setPin('');
      }
    } catch {
      setPinError('Gagal memverifikasi PIN.');
      setPin('');
    }
  };

  const appendPinDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      setPinError('');
    }
  };

  const backspacePin = () => {
    setPin((current) => current.slice(0, -1));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
      setManualCode('');
    }
  };

  const startScanner = async () => {
    if (!scannerRef.current || html5QrCodeRef.current) return;

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          handleScan(decodedText);
        },
        () => {
          // Ignore scan errors
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Failed to start scanner:', error);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setIsScanning(false);
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  // Scan nonaktif / ditutup
  if (!scanActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">Scan Ditutup</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Presensi scan untuk {eventTitle || `${type} ini`} sedang tidak aktif. Silakan hubungi admin.
          </p>
        </div>
      </div>
    );
  }

  // PIN form
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-navy-900 to-slate-900 px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="text-center">
              <img src="/images/logo-placeholder.webp" alt="GPI Eluzai Kids" className="mx-auto h-14 w-14 object-contain" />
              <h1 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">Presensi {type === 'event' ? 'Event' : 'Kegiatan'}</h1>
              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{eventTitle || 'GPI Eluzai Kids'}</p>
            </div>

            {pinError && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {pinError}
              </div>
            )}

            <p className="mt-5 text-center text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Masukkan PIN 6 digit</p>

            {/* PIN boxes */}
            <div className="mt-3 flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-xl font-bold transition ${
                    index === pin.length
                      ? 'border-brand-500 bg-brand-50 text-brand-500 dark:bg-brand-950/40'
                      : pin[index]
                        ? 'border-slate-300 text-slate-900 dark:border-slate-600 dark:text-white'
                        : 'border-slate-200 text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {pin[index] ? '●' : ''}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="mx-auto mt-6 grid max-w-[220px] grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => appendPinDigit(digit)}
                  className="rounded-xl py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {digit}
                </button>
              ))}
              <div />
              <button
                type="button"
                onClick={() => appendPinDigit('0')}
                className="rounded-xl py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                0
              </button>
              <button
                type="button"
                onClick={backspacePin}
                aria-label="Hapus digit"
                className="flex items-center justify-center rounded-xl py-3 text-slate-400 transition hover:bg-slate-100 active:scale-95 dark:hover:bg-slate-800"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
                  <path d="m18 9-6 6M12 9l6 6" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              disabled={pin.length !== 6}
              onClick={() => void handlePinSubmit({ preventDefault: () => {} } as React.FormEvent)}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"
            >
              Masuk
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Scanner page
  return (
    <div className="min-h-[80vh] bg-slate-900">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-white">
            {type === 'event' ? 'Scan Event' : 'Scan Kegiatan'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Arahkan kamera ke QR Code atau masukkan kode manual
          </p>
        </div>

        {/* Scan result toast */}
        {scanResult && (
          <div className={`mt-4 rounded-xl p-4 text-center ${scanResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <p className="font-semibold">{scanResult.message}</p>
            {scanResult.name && (
              <p className="mt-1 text-sm">{scanResult.name} ({scanResult.jumlah_hadir} orang)</p>
            )}
          </div>
        )}

        {/* QR Scanner */}
        <div className="mt-6 rounded-2xl bg-slate-800 p-4">
          <div id="qr-reader" ref={scannerRef} className="w-full overflow-hidden rounded-xl" />

          <div className="mt-4 flex gap-3">
            {!isScanning ? (
              <button onClick={startScanner} className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700">
                📷 Mulai Scan
              </button>
            ) : (
              <button onClick={stopScanner} className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                ⏹ Stop Scan
              </button>
            )}
          </div>
        </div>

        {/* Manual input */}
        <div className="mt-4 rounded-2xl bg-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white">Input Manual</h3>
          <form onSubmit={handleManualSubmit} className="mt-3 flex gap-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="0001"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
            <button type="submit" className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              Submit
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-slate-400">Masukkan 4 angka terakhir nomor registrasi, misalnya 0001 atau 0120.</p>
      </div>
    </div>
  );
}