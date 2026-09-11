import { exportRekapXlsx } from '@/lib/export-rekap';
import type { RekapExportOptions } from '@/lib/export-rekap';

export const dynamic = 'force-dynamic';

const options: RekapExportOptions = {
  entityTable: 'activities',
  entityColumns: 'id, title',
  registrationTable: 'activity_registrations',
  idColumn: 'activity_id',
  notFoundMessage: 'Kegiatan tidak ditemukan.',
  registrationColumns: 'name, phone, email, jumlah_hadir, nomor_registrasi, registered_at',
  sheetName: 'Rekap Pendaftar',
  xlsxColumns: [
    { header: 'No', key: 'no', width: 6 },
    { header: 'No. Registrasi', key: 'nomorRegistrasi', width: 18 },
    { header: 'Nama lengkap', key: 'name', width: 32 },
    { header: 'No. HP', key: 'phone', width: 18 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Jumlah hadir', key: 'jumlahHadir', width: 12 },
  ],
  mapRow: (row, index) => ({
    no: index + 1,
    nomorRegistrasi: row.nomor_registrasi,
    name: row.name,
    phone: row.phone,
    email: row.email || '-',
    jumlahHadir: row.jumlah_hadir,
  }),
  entityTitle: (entity) => `Rekap Data Pendaftar #${entity.title}`,
};

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return exportRekapXlsx(params.id, options);
}