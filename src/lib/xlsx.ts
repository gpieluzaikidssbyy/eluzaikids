import ExcelJS from 'exceljs';

export interface XlsxColumn {
  header: string;
  key: string;
  width?: number;
}

/**
 * Build a styled .xlsx workbook buffer (real binary Excel file).
 * Header row is bold on a muted background with a filter + freeze pane.
 */
export async function buildXlsxBuffer(
  sheetName: string,
  columns: XlsxColumn[],
  rows: Record<string, unknown>[]
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'GPI Eluzai Kids';
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 20 }));
  if (rows.length) sheet.addRows(rows);

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.height = 20;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFECF3FF' },
    };
  });

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(rows.length + 1, 1), column: columns.length },
  };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const bytes = (await workbook.xlsx.writeBuffer()) as unknown as ArrayBuffer;
  return new Uint8Array(bytes).buffer;
}

export function xlsxResponse(buffer: ArrayBuffer, filename: string) {
  return new Response(buffer, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}