'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, QrCode, Shield, Users, CheckCircle2, XCircle, Loader2, ExternalLink, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/admin/page-header';
import { Loading } from '@/components/admin/loading';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminPresensiEventDetailPage() {
  const params = useParams();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [totals, setTotals] = useState({ totalHadir: 0, totalRegistrations: 0, totalHadirCount: 0, totalBelumHadir: 0 });
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [scanPin, setScanPin] = useState('');
  const [quickCode, setQuickCode] = useState('');
  const [quickResult, setQuickResult] = useState<any>(null);

  const fetchData = (currentTab = tab, currentSearch = search) => {
    fetch(`/api/admin/registrants?type=event&id=${params.id}&tab=${currentTab}&search=${currentSearch}`)
      .then((r) => r.json())
      .then((d) => {
        setRegistrations(d.registrations || []);
        setTotals({ totalHadir: d.totalHadir, totalRegistrations: d.totalRegistrations, totalHadirCount: d.totalHadirCount, totalBelumHadir: d.totalBelumHadir });
      });
    fetch(`/api/admin/events/${params.id}`).then((r) => r.json()).then(setEvent);
  };

  useEffect(() => {
    void fetchData();
    const interval = window.setInterval(() => fetchData(), 5000);
    return () => window.clearInterval(interval);
  }, [params.id]);

  const toggleHadir = async (registrationId: number) => {
    const res = await fetch('/api/admin/presensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-hadir', type: 'event', id: params.id, registrationId }),
    });
    const data = await res.json();
    setTotals({ totalHadir: data.totalHadir, totalRegistrations: data.totalRegistrations, totalHadirCount: data.totalHadirCount, totalBelumHadir: data.totalBelumHadir });
    fetchData();
  };

  const toggleScan = async () => {
    await fetch('/api/admin/presensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-scan', type: 'event', id: params.id }),
    });
    fetchData();
  };

  const updateScanPin = async () => {
    if (scanPin.length !== 6) return;
    await fetch('/api/admin/presensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update-scan-pin', type: 'event', id: params.id, scan_pin: scanPin }),
    });
    setScanPin('');
    toast.success('PIN berhasil diperbarui.');
  };

  const quickMark = async () => {
    if (!quickCode.trim()) return;
    const res = await fetch('/api/admin/presensi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'quick-mark', type: 'event', id: params.id, code: quickCode.trim() }),
    });
    const data = await res.json();
    setQuickResult(data);
    setQuickCode('');
    fetchData();
    setTimeout(() => setQuickResult(null), 3000);
  };

  if (!event) return <Loading label="Memuat data presensi..." />;

  const hadirPercent = totals.totalRegistrations > 0 ? Math.round((totals.totalHadir / totals.totalRegistrations) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <PageHeader
        icon={<QrCode className="h-6 w-6" />}
        title={`Presensi: ${event.title}`}
        description={event.location || ''}
        backHref="/admin/presensi/events"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-card text-center">
          <Users className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-3xl font-bold text-foreground">{totals.totalRegistrations}</p>
          <p className="mt-1 text-sm text-muted-foreground">Total Pendaftar</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-card text-center">
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
          <p className="text-3xl font-bold text-success">{totals.totalHadir}</p>
          <p className="mt-1 text-sm text-muted-foreground">Hadir</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-card text-center">
          <XCircle className="mx-auto mb-2 h-6 w-6 text-destructive" />
          <p className="text-3xl font-bold text-destructive">{totals.totalBelumHadir}</p>
          <p className="mt-1 text-sm text-muted-foreground">Belum Hadir</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-4"
      >
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{totals.totalHadir}/{totals.totalRegistrations} hadir</span>
          <span className="font-semibold text-primary">{hadirPercent}%</span>
        </div>
        <Progress value={hadirPercent} className="h-2" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-card">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <QrCode className="h-5 w-5 text-primary" />
            Kontrol Scan QR
          </h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleScan}
                variant={event.scan_active ? 'destructive' : 'default'}
              >
                {event.scan_active ? 'Nonaktifkan Scan' : 'Aktifkan Scan'}
              </Button>
              {event.scan_active && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Aktif
                </span>
              )}
            </div>
            <Link
              href={`/scan-qr/event/${params.id}`}
              target="_blank"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              Buka Website Scan QR
            </Link>
            <div className="flex gap-2">
              <Input
                type="text"
                value={scanPin}
                onChange={(e) => setScanPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="PIN 6 digit"
                maxLength={6}
                className="flex-1"
              />
              <Button onClick={updateScanPin} variant="secondary">
                <Shield className="mr-1.5 h-4 w-4" />
                Set PIN
              </Button>
            </div>
            {event.scan_pin && <p className="text-xs text-muted-foreground">PIN saat ini: {event.scan_pin}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 shadow-card">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Quick Mark Hadir
          </h3>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                placeholder="Nomor registrasi"
                className="flex-1"
              />
              <Button onClick={quickMark}>Mark</Button>
            </div>
            {quickResult && (
              <p className={cn('rounded-xl px-3 py-2 text-sm font-medium', quickResult.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                {quickResult.message} {quickResult.name ? `(${quickResult.name})` : ''}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="mt-6"
      >
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-xl border border-border">
              {['all', 'hadir', 'belum_hadir'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); fetchData(t, search); }}
                  className={cn(
                    'px-4 py-2 text-sm font-medium transition',
                    tab === t ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {t === 'all' ? 'Semua' : t === 'hadir' ? 'Hadir' : 'Belum Hadir'}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); fetchData(tab, e.target.value); }}
                placeholder="Cari no. registrasi..."
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="mt-4"
      >
        <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="table-heading">No</TableHead>
                <TableHead className="table-heading">No. registrasi</TableHead>
                <TableHead className="table-heading">Nama lengkap</TableHead>
                <TableHead className="table-heading">Status</TableHead>
                <TableHead className="table-heading text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((r: any, index: number) => (
                <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="table-cell text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="table-cell font-mono text-xs">{r.nomor_registrasi}</TableCell>
                  <TableCell className="table-cell font-medium text-foreground">{r.name}</TableCell>
                  <TableCell className="table-cell">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      r.hadir
                        ? 'bg-success/10 text-success'
                        : 'bg-muted/50 text-muted-foreground'
                    )}>
                      {r.hadir && <CheckCircle2 className="h-3 w-3" />}
                      {r.hadir ? 'Hadir' : 'Belum hadir'}
                    </span>
                  </TableCell>
                  <TableCell className="table-cell text-center">
                    <Button
                      onClick={() => void toggleHadir(r.id)}
                      variant={r.hadir ? 'secondary' : 'default'}
                      size="sm"
                    >
                      {r.hadir ? 'Batalkan' : 'Hadir'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!registrations.length && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              {tab === 'hadir' ? 'Belum ada data' : 'Belum ada pendaftar.'}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
