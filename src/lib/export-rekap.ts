import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/guards';
import { safeFilename } from '@/lib/sanitize';
import { buildXlsxBuffer, xlsxResponse } from '@/lib/xlsx';
import type { XlsxColumn } from '@/lib/xlsx';

export interface RekapExportOptions {
  entityTable: 'events' | 'activities';
  entityColumns: string;
  registrationTable: 'event_registrations' | 'activity_registrations';
  idColumn: 'event_id' | 'activity_id';
  notFoundMessage: string;
  registrationColumns: string;
  sheetName: string;
  xlsxColumns: XlsxColumn[];
  mapRow: (row: any, index: number) => Record<string, unknown>;
  entityTitle: (entity: any) => string;
}

export async function exportRekapXlsx(id: string, options: RekapExportOptions) {
  const guard = await requireAdmin();
  if (guard.denied) return guard.response;

  const supabase = createServiceClient();

  const { data: entity } = await supabase
    .from(options.entityTable)
    .select(options.entityColumns)
    .eq('id', id)
    .single();

  if (!entity) {
    return NextResponse.json({ message: options.notFoundMessage }, { status: 404 });
  }

  const { data: records } = await supabase
    .from(options.registrationTable)
    .select(options.registrationColumns)
    .eq(options.idColumn, id)
    .order('registered_at', { ascending: false });

  const rows = (records || []).map(options.mapRow);

  const buffer = await buildXlsxBuffer(options.sheetName, options.xlsxColumns, rows);
  const title = options.entityTitle(entity);
  return xlsxResponse(buffer, `${safeFilename(title)}.xlsx`);
}