import { exportRekapXlsx } from '@/lib/export-rekap';
import type { RekapExportOptions } from '@/lib/export-rekap';

export const dynamic = 'force-dynamic';

const options: RekapExportOptions = {
  entityTable: 'events',
  entityColumns: 'id, title',
  registrationTable: 'event_registrations',
  idColumn: 'event_id',
  notFoundMessage: 'Event tidak ditemukan.',
  registrationColumns: 'name, nomor_registrasi, hadir, registered_at',
  sheetName: 'Rekap Kehadiran',
  xlsxColumns: [
    { header: 'No', key: 'no', width: 6 },
    { header: 'No. Registrasi', key: 'nomorRegistrasi', width: 18 },
    { header: 'Nama lengkap', key: 'name', width: 32 },
    { header: 'Status kehadiran', key: 'status', width: 18 },
  ],
  mapRow: (row, index) => ({
    no: index + 1,
    nomorRegistrasi: row.nomor_registrasi,
    name: row.name,
    status: row.hadir ? 'Hadir' : 'Tidak hadir',
  }),
  entityTitle: (entity) => `Rekap Kehadiran ${entity.title}`,
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return exportRekapXlsx(params.id, options);
}