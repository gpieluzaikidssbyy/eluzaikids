'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminPresensiActivityDetailPage() {
  const params = useParams();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [totals, setTotals] = useState({ totalHadir: 0, totalRegistrations: 0, totalHadirCount: 0, totalBelumHadir: 0 });
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [scanPin, setScanPin] = useState('');
  const [quickCode, setQuickCode] = useState('');
  const [quickResult, setQuickResult] = useState<any>(null);

  const fetchData = (currentTab = tab, currentSearch = search) => {
    fetch(`/api/admin/registrants?type=activity&id=${params.id}&tab=${currentTab}&search=${currentSearch}`)
      .then((r) => r.json())
      .then((d) => { setRegistrations(d.registrations || []); setTotals({ totalHadir: d.totalHadir, totalRegistrations: d.totalRegistrations, totalHadirCount: d.totalHadirCount, totalBelumHadir: d.totalBelumHadir }); });
    fetch(`/api/admin/activities/${params.id}`).then((r) => r.json()).then(setActivity);
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const toggleHadir = async (rid: number) => {
    const res = await fetch('/api/admin/presensi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle-hadir', type: 'activity', id: params.id, registrationId: rid }) });
    const d = await res.json();
    setTotals({ totalHadir: d.totalHadir, totalRegistrations: d.totalRegistrations, totalHadirCount: d.totalHadirCount, totalBelumHadir: d.totalBelumHadir });
    fetchData();
  };

  const toggleScan = async () => {
    await fetch('/api/admin/presensi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle-scan', type: 'activity', id: params.id }) });
    fetchData();
  };

  const updateScanPin = async () => {
    if (scanPin.length !== 6) return;
    await fetch('/api/admin/presensi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update-scan-pin', type: 'activity', id: params.id, scan_pin: scanPin }) });
    setScanPin('');
    alert('PIN berhasil diperbarui.');
  };

  const quickMark = async () => {
    if (!quickCode.trim()) return;
    const res = await fetch('/api/admin/presensi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'quick-mark', type: 'activity', id: params.id, code: quickCode.trim() }) });
    const d = await res.json();
    setQuickResult(d);
    setQuickCode('');
    fetchData();
    setTimeout(() => setQuickResult(null), 3000);
  };

  if (!activity) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  return (
    <div>
      <Link href="/admin/presensi/activities" className="text-sm text-brand-600 hover:underline">&larr; Kembali</Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-white">Presensi: {activity.title}</h1>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        <div className="card text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">{totals.totalRegistrations}</p><p className="text-sm text-slate-500">Total Pendaftar</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-green-600">{totals.totalHadir}</p><p className="text-sm text-slate-500">Total Hadir (Orang)</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-blue-600">{totals.totalHadirCount}</p><p className="text-sm text-slate-500">Hadir (Data)</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-red-600">{totals.totalBelumHadir}</p><p className="text-sm text-slate-500">Belum Hadir</p></div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Kontrol Scan QR</h3>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={toggleScan} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${activity.scan_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
              {activity.scan_active ? 'Nonaktifkan Scan' : 'Aktifkan Scan'}
            </button>
            {activity.scan_active && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Aktif</span>}
          </div>
          <div className="mt-3 flex gap-2">
            <input type="text" value={scanPin} onChange={(e) => setScanPin(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="PIN 6 digit" maxLength={6} className="input-field flex-1" />
            <button onClick={updateScanPin} className="btn-primary">Set PIN</button>
          </div>
          {activity.scan_pin && <p className="mt-2 text-xs text-slate-500">PIN saat ini: {activity.scan_pin}</p>}
        </div>
        <div className="card">
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Quick Mark Hadir</h3>
          <div className="mt-3 flex gap-2">
            <input type="text" value={quickCode} onChange={(e) => setQuickCode(e.target.value)} placeholder="Nomor registrasi" className="input-field flex-1" />
            <button onClick={quickMark} className="btn-primary">Mark</button>
          </div>
          {quickResult && <p className={`mt-2 text-sm font-medium ${quickResult.success ? 'text-green-600' : 'text-red-600'}`}>{quickResult.message} {quickResult.name ? `(${quickResult.name})` : ''}</p>}
          <p className="mt-2 text-xs text-slate-500">Scanner: <Link href={`/scan-qr/activity/${params.id}`} className="text-brand-600 hover:underline" target="_blank">Buka Scanner</Link></p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700">
          {['all', 'hadir', 'belum_hadir'].map((t) => (
            <button key={t} onClick={() => { setTab(t); fetchData(t, search); }} className={`px-4 py-2 text-sm font-medium ${tab === t ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              {t === 'all' ? 'Semua' : t === 'hadir' ? 'Hadir' : 'Belum Hadir'}
            </button>
          ))}
        </div>
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); fetchData(tab, e.target.value); }} placeholder="Cari no. registrasi..." className="input-field max-w-xs" />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">No. Registrasi</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Nama</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Jumlah Hadir</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {registrations.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-4 py-3 font-mono text-xs">{r.nomor_registrasi}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                <td className="px-4 py-3 text-slate-600">{r.jumlah_hadir}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.hadir ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{r.hadir ? 'Hadir' : 'Belum'}</span></td>
                <td className="px-4 py-3"><button onClick={() => toggleHadir(r.id)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${r.hadir ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>{r.hadir ? 'Batal Hadir' : 'Tandai Hadir'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
