'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import type { Event, EventRegistration } from '@/lib/types';
import { formatDateIndo } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/admin/page-header';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Pencil, Trash2, Users, Clock, MapPin, Calendar, Loader2 } from 'lucide-react';

type AdminEvent = Event & { registrations_count: number };

export default function AdminEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<AdminEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [eventResponse, registrationsResponse] = await Promise.all([
      fetch(`/api/admin/events/${params.id}`),
      fetch(`/api/admin/registrants?type=event&id=${params.id}`),
    ]);
    const eventData = await eventResponse.json();
    const registrationData = await registrationsResponse.json();
    setEvent(eventData);
    setRegistrations(registrationData.registrations || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadData();
    const interval = window.setInterval(() => void loadData(), 5000);
    return () => window.clearInterval(interval);
  }, [params.id]);

  const handleDelete = async () => {
    await fetch(`/api/admin/events/${params.id}`, { method: 'DELETE' });
    toast.success('Event berhasil dihapus.');
    router.push('/admin/events');
  };

  if (loading || !event) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { icon: Clock, label: 'Open gate', value: event.open_gate?.slice(0, 5) || '-' },
    { icon: Calendar, label: 'Mulai pukul', value: event.start_time?.slice(0, 5) || '-' },
    { icon: Users, label: 'Kuota', value: event.quota ?? 'Tanpa batas' },
    { icon: Users, label: 'Total pendaftar', value: registrations.length, highlight: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="rounded-xl bg-gradient-to-br from-primary via-blue-700 to-blue-900 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-5">
            {event.tema && (
              <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white/15 sm:flex">
                <Calendar className="h-10 w-10 text-white/80" />
              </div>
            )}
            <div>
              <Link href="/admin/events" className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-white/60 transition-colors hover:text-white">
                ← Kembali ke Manage Event
              </Link>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{event.title}</h1>
              {event.tema && <p className="mt-1 text-sm text-white/70">Tema: {event.tema}</p>}
              <p className="mt-2 flex items-center gap-2 text-sm text-white/70">
                <Calendar className="h-4 w-4" />
                {formatDateIndo(event.event_date)}
                {event.location && (
                  <>
                    <span className="text-white/30">·</span>
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link href={`/admin/events/${event.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/registrants/events/${event.id}`}>
                <Users className="mr-2 h-4 w-4" />
                Manage registrants
              </Link>
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              }
              title="Hapus event ini?"
              description="Semua data pendaftaran terkait juga akan dihapus."
              onConfirm={() => void handleDelete()}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="rounded-xl border bg-card p-6 shadow-card">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <stat.icon className="h-3.5 w-3.5" />
                {stat.label}
              </div>
              <p className={cn(
                "mt-2 text-lg font-bold",
                stat.highlight ? "text-primary" : "text-foreground"
              )}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border bg-card p-6 shadow-card">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Informasi event</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{event.description || 'Deskripsi event belum diisi.'}</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-card p-6 shadow-card">
        <CardHeader className="p-0 pb-4">
          <CardTitle>Hasil form pendaftaran</CardTitle>
          <CardDescription className="mt-1 flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Data diperbarui otomatis setiap 5 detik.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="table-heading">No</TableHead>
                  <TableHead className="table-heading">No. registrasi</TableHead>
                  <TableHead className="table-heading">Nama lengkap</TableHead>
                  <TableHead className="table-heading">No. HP</TableHead>
                  <TableHead className="table-heading">Email</TableHead>
                  <TableHead className="table-heading">Jumlah yang hadir</TableHead>
                  <TableHead className="table-heading">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration, index) => (
                  <TableRow key={registration.id}>
                    <TableCell className="table-cell text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="table-cell font-mono text-xs">{registration.nomor_registrasi}</TableCell>
                    <TableCell className="table-cell font-medium text-foreground">{registration.name}</TableCell>
                    <TableCell className="table-cell">{registration.phone}</TableCell>
                    <TableCell className="table-cell">{registration.email || '-'}</TableCell>
                    <TableCell className="table-cell font-semibold">{registration.jumlah_hadir}</TableCell>
                    <TableCell className="table-cell">
                      {registration.hadir ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Telah hadir</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Belum hadir</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!registrations.length && (
            <p className="py-10 text-center text-sm text-muted-foreground">Belum ada hasil form pendaftaran.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
