import ExcelJS from 'exceljs';

export interface ExcelExportColumn<T = any> {
  header: string;
  key: string;
  width?: number;
  format?: (item: T) => string | number;
}

export async function exportTableToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExcelExportColumn<T>[],
  filename: string = 'export_data'
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TaxCRM Engine';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Records', {
    views: [{ showGridLines: true }],
  });

  // Setup columns
  worksheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width || Math.max(c.header.length + 5, 18),
  }));

  // Style Header
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' },
    };
    cell.font = {
      name: 'Geist',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
    };
  });

  // Add Data Rows
  data.forEach((item, index) => {
    const rowData: Record<string, any> = {};
    columns.forEach((col) => {
      if (col.format) {
        rowData[col.key] = col.format(item);
      } else {
        rowData[col.key] = item[col.key] ?? '';
      }
    });

    const row = worksheet.addRow(rowData);
    row.height = 20;

    const isEven = index % 2 === 1;
    row.eachCell((cell) => {
      cell.font = {
        name: 'Geist',
        size: 9,
        color: { argb: 'FF0F172A' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    });
  });

  // Download trigger
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 150);
}
