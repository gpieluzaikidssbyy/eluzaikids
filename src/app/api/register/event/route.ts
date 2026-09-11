import { NextRequest } from 'next/server';
import { handleRegistration } from '@/lib/register';
import type { RegistrationConfig } from '@/lib/register';

const config: RegistrationConfig = {
  entityTable: 'events',
  registrationTable: 'event_registrations',
  idColumn: 'event_id',
  typeParam: 'event',
  typeLabel: 'Event',
  dateField: 'event_date',
  notFoundMessage: 'Event tidak ditemukan.',
  quotaFullMessage: 'Kuota pendaftaran untuk event ini sudah penuh.',
  duplicateMessage: 'Data serupa (IP, nama, nomor HP, atau email) sudah terdaftar untuk event tersebut.',
  hasEventExtras: true,
};

export async function POST(request: NextRequest) {
  return handleRegistration(request, config);
}