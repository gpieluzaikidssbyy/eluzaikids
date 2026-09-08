'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Lock, QrCode, Camera, CameraOff, Delete, ChevronRight, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function ScanQrPage() {
  const params = useParams();
  const { type, id } = params;
  const [loading, setLoading] = useState(true);
  const [scanActive, setScanActive] = useState(true);
  const [eventTitle, setEventTitle] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [scanToken, setScanToken] = useState('');
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
        body: JSON.stringify({ qr_data: qrData, scan_token: scanToken }),
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
        setScanToken(typeof data.scan_token === 'string' ? data.scan_token : '');
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-navy-950">
        <div className="relative">
          <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand-500/30" />
          <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-white/10 border-t-brand-500" />
        </div>
        <p className="text-sm font-medium text-slate-400">Menyiapkan presensi...</p>
      </div>
    );
  }

  // Scan nonaktif / ditutup
  if (!scanActive) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
        <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/30">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold text-white">Scan Ditutup</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Presensi scan untuk <span className="font-semibold text-white">{eventTitle || `${type} ini`}</span> sedang tidak aktif. Silakan hubungi admin.
          </p>
        </div>
      </div>
    );
  }

  // PIN form
  if (!isAuthorized) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-10">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative w-full max-w-sm">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">
            <div className="h-1.5 bg-gradient-to-r from-brand-500 via-sky-400 to-brand-600" />
            <div className="p-8 sm:p-9">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <img src="/images/logo.webp" alt="GPI Eluzai Kids" className="h-10 w-10 object-contain" />
                </div>
                <h1 className="mt-4 font-display text-xl font-bold text-white">Presensi {type === 'event' ? 'Event' : 'Kegiatan'}</h1>
                <p className="mt-1 truncate text-sm text-slate-400">{eventTitle || 'GPI Eluzai Kids'}</p>
              </div>

              {pinError && (
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  {pinError}
                </div>
              )}

              <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Masukkan PIN 6 digit</p>

              {/* PIN boxes */}
              <div className="mt-3 flex justify-center gap-2.5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex h-14 w-11 items-center justify-center rounded-xl border text-lg font-bold transition ${
                      index === pin.length
                        ? 'border-brand-500/70 bg-brand-500/10 text-brand-300 shadow-lg shadow-brand-500/10'
                        : pin[index]
                          ? 'border-white/20 bg-white/5 text-white'
                          : 'border-white/10 bg-white/[0.02] text-white/20'
                    }`}
                  >
                    {pin[index] ? '●' : ''}
                  </div>
                ))}
              </div>

              {/* Keypad */}
              <div className="mx-auto mt-7 grid max-w-[230px] grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => appendPinDigit(digit)}
                    className="rounded-2xl py-3.5 text-lg font-semibold text-white transition hover:bg-white/10 active:scale-95"
                  >
                    {digit}
                  </button>
                ))}
                <div />
                <button
                  type="button"
                  onClick={() => appendPinDigit('0')}
                  className="rounded-2xl py-3.5 text-lg font-semibold text-white transition hover:bg-white/10 active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={backspacePin}
                  aria-label="Hapus digit"
                  className="flex items-center justify-center rounded-2xl py-3.5 text-slate-500 transition hover:bg-white/10 active:scale-95"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>

              <button
                type="button"
                disabled={pin.length !== 6}
                onClick={() => void handlePinSubmit({ preventDefault: () => {} } as React.FormEvent)}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-400 hover:to-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Masuk
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" />
            Akses terbatas untuk petugas presensi
          </p>
        </div>
      </div>
    );
  }

  // Scanner page
  return (
    <div className="min-h-screen bg-navy-950">
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <QrCode className="h-6 w-6 text-brand-400" />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold text-white">
            {type === 'event' ? 'Scan Event' : 'Scan Kegiatan'}
          </h1>
          {eventTitle && <p className="mt-1 truncate text-sm text-slate-400">{eventTitle}</p>}
          <p className="mt-3 text-sm text-slate-400">
            Arahkan kamera ke QR Code atau masukkan kode manual
          </p>
        </div>

        {/* Scan result toast */}
        {scanResult && (
          <div
            className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
              scanResult.success
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/20 bg-red-500/10 text-red-300'
            }`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${scanResult.success ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {scanResult.success ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold">{scanResult.message}</p>
              {scanResult.name && (
                <p className="mt-0.5 text-sm opacity-90">{scanResult.name} ({scanResult.jumlah_hadir} orang)</p>
              )}
            </div>
          </div>
        )}

        {/* QR Scanner */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
          <div className="relative overflow-hidden rounded-2xl bg-black/40">
            <div id="qr-reader" ref={scannerRef} className="w-full" />
            {isScanning && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-56 w-56">
                  <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-xl border-l-2 border-t-2 border-brand-400" />
                  <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-xl border-r-2 border-t-2 border-brand-400" />
                  <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-xl border-b-2 border-l-2 border-brand-400" />
                  <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-xl border-b-2 border-r-2 border-brand-400" />
                  <span className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 animate-pulse bg-brand-400/60" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            {!isScanning ? (
              <button
                onClick={startScanner}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500"
              >
                <Camera className="h-4 w-4" />
                Mulai Scan
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:from-red-400 hover:to-rose-500"
              >
                <CameraOff className="h-4 w-4" />
                Stop Scan
              </button>
            )}
          </div>
        </div>

        {/* Manual input */}
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-white">Input Manual</h3>
          <form onSubmit={handleManualSubmit} className="mt-3 flex gap-3">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="ELZ-YYMMDD-KXXX"
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-400 hover:to-brand-500"
            >
              Submit
            </button>
          </form>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3 w-3" />
            Masukkan nomor registrasi lengkap dengan format ELZ-YYMMDD-KXXX.
          </p>
        </div>
      </div>
    </div>
  );
}
