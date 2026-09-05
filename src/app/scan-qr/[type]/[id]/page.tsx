'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';

export default function ScanQrPage() {
  const params = useParams();
  const { type, id } = params;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; jumlah_hadir?: number } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

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
      }
    } catch {
      setPinError('Gagal memverifikasi PIN.');
    }
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

  // PIN form
  if (!isAuthorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="card text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-white">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-slate-100">
              Verifikasi PIN
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Masukkan PIN 6 digit untuk mengakses scanner
            </p>

            <form onSubmit={handlePinSubmit} className="mt-6 space-y-4">
              {pinError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  {pinError}
                </div>
              )}
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="input-field text-center text-2xl tracking-[0.5em]"
              />
              <button type="submit" className="w-full btn-primary">
                Masuk
              </button>
            </form>
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
              placeholder="Nomor registrasi"
              className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
            <button type="submit" className="rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
