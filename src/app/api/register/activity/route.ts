import { NextRequest } from 'next/server';
import { handleRegistration } from '@/lib/register';
import type { RegistrationConfig } from '@/lib/register';

const config: RegistrationConfig = {
  entityTable: 'activities',
  registrationTable: 'activity_registrations',
  idColumn: 'activity_id',
  typeParam: 'activity',
  typeLabel: 'Activity',
  dateField: 'activity_date',
  notFoundMessage: 'Kegiatan tidak ditemukan.',
  quotaFullMessage: 'Kuota pendaftaran untuk kegiatan ini sudah penuh.',
  duplicateMessage: 'Data serupa (IP, nama, nomor HP, atau email) sudah terdaftar untuk kegiatan tersebut.',
  hasEventExtras: false,
};

export async function POST(request: NextRequest) {
  return handleRegistration(request, config);
}