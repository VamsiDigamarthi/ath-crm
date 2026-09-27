import ExcelJS from 'exceljs';
import type { ParsedLeadRow } from '../types/bulk-import.types';
import { validateLeadRow } from './lead-validator';
import { normalizePriority, normalizeHeaderKey } from './csv-helper';

/**
 * Generates and downloads a native Excel (.xlsx) file with Emerald Green background (#16A34A) and Bold 700 font
 */
export async function downloadStyledExcelTemplate(taxYear: number = new Date().getFullYear()): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TaxCRM Engine';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`Tax Leads TY${taxYear}`, {
    views: [{ showGridLines: true }],
  });

  // Define columns: ONLY Name, Email Address, Phone Number
  worksheet.columns = [
    { header: 'Name *', key: 'name', width: 28 },
    { header: 'Email Address *', key: 'email', width: 32 },
    { header: 'Phone Number *', key: 'phone', width: 24 },
  ];

  // Style Header Row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 32;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' },
    };

    cell.font = {
      name: 'Poppins',
      family: 2,
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };

    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };

    cell.border = {
      top: { style: 'thin', color: { argb: 'FF15803D' } },
      left: { style: 'thin', color: { argb: 'FF15803D' } },
      bottom: { style: 'medium', color: { argb: 'FF15803D' } },
      right: { style: 'thin', color: { argb: 'FF15803D' } },
    };
  });

  // Sample data rows containing ONLY Name, Email, Phone
  const sampleData = [
    {
      name: 'Arjun Varma',
      email: 'arjun.varma@gmail.com',
      phone: '+1 (415) 555-0142',
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@outlook.com',
      phone: '+1 (312) 555-0199',
    },
    {
      name: 'Vikram Singhania',
      email: 'vikram.s@apextech.io',
      phone: '+1 (206) 555-0187',
    },
    {
      name: 'Sneha Patel',
      email: 'sneha.patel@yahoo.com',
      phone: '+1 (512) 555-0134',
    },
  ];

  // Add rows & style them
  sampleData.forEach((item, index) => {
    const row = worksheet.addRow(item);
    row.height = 24;

    const isEven = index % 2 === 1;
    row.eachCell((cell) => {
      cell.font = {
        name: 'Poppins',
        size: 10,
        color: { argb: 'FF1E293B' },
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };

      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
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

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `tax_leads_template_${taxYear}.xlsx`);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 150);
}



function extractCleanCellValue(cellValue: unknown): string {
  if (cellValue === null || cellValue === undefined) return '';
  if (typeof cellValue === 'string') {
    const trimmed = cellValue.trim();
    return trimmed === '[object Object]' ? '' : trimmed;
  }
  if (typeof cellValue === 'number' || typeof cellValue === 'boolean') {
    return String(cellValue);
  }
  if (cellValue instanceof Date) {
    if (isNaN(cellValue.getTime())) return '';
    return cellValue.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  }
  if (typeof cellValue === 'object') {
    const obj = cellValue as Record<string, any>;
    // RichText format: { richText: [{ text: '...' }, ...] }
    if (Array.isArray(obj.richText)) {
      return obj.richText.map((rt: any) => rt.text || '').join('').trim();
    }
    // Hyperlink / Text object format: { text: '...', hyperlink: '...' }
    if (obj.text !== undefined && obj.text !== null) {
      if (typeof obj.text === 'object') return extractCleanCellValue(obj.text);
      const s = String(obj.text).trim();
      return s === '[object Object]' ? '' : s;
    }
    // Formula result format: { formula: '...', result: '...' }
    if (obj.result !== undefined && obj.result !== null) {
      return extractCleanCellValue(obj.result);
    }
    if (obj.value !== undefined && obj.value !== null) {
      return extractCleanCellValue(obj.value);
    }
    return '';
  }
  return '';
}

/**
 * Parses native Excel (.xlsx / .xls) buffer into ParsedLeadRow array with strict validations
 */
export async function parseExcelFileBuffer(
  arrayBuffer: ArrayBuffer,
  defaultTaxYear: number = new Date().getFullYear()
): Promise<ParsedLeadRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rawRows: string[][] = [];
  worksheet.eachRow((row) => {
    const rowValues: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      const val = extractCleanCellValue(cell.value);
      rowValues.push(val.trim());
    });
    if (rowValues.some((c) => c.length > 0)) {
      rawRows.push(rowValues);
    }
  });

  if (rawRows.length < 2) return [];

  const headers = rawRows[0].map(normalizeHeaderKey);
  const dataRows = rawRows.slice(1);

  return dataRows.map((row, index): ParsedLeadRow => {
    const rawObj: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      rawObj[header] = row[colIdx] || '';
    });

    let firstName = (rawObj.firstName || '').trim();
    const middleName = (rawObj.middleName || '').trim();
    let lastName = (rawObj.lastName || '').trim();
    if (!firstName && rawObj.fullName) {
      const parts = rawObj.fullName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    const email = (rawObj.email || '').trim().toLowerCase();
    const phone = (rawObj.phone || '').trim();
    const ssnTin = (rawObj.ssnTin || '').trim();
    const dob = (rawObj.dob || '').trim();
    const occupation = (rawObj.occupation || '').trim();
    const visaType = (rawObj.visaType || '').trim();
    const maritalStatus = (rawObj.maritalStatus || '').trim();
    const parsedYear = parseInt(rawObj.taxYear, 10);
    const taxYear = !isNaN(parsedYear) && parsedYear > 2000 ? parsedYear : defaultTaxYear;
    const filingType = (
      rawObj.filingType?.toUpperCase() === 'CORPORATE' ? 'CORPORATE' : 'INDIVIDUAL'
    ) as 'INDIVIDUAL' | 'CORPORATE';
    const addressLine1 = (rawObj.addressLine1 || '').trim();
    const city = (rawObj.city || '').trim();
    const state = (rawObj.state || '').trim();
    const zipCode = (rawObj.zipCode || '').trim();
    const estimatedIncome = (rawObj.estimatedIncome || '').trim();
    const source = (rawObj.source || 'Excel Import').trim();

    // Perform strict row validation
    const valResult = validateLeadRow({
      firstName,
      lastName,
      email,
      phone,
      visaType,
      state,
    });

    return {
      id: `LEAD-${String(index + 1).padStart(4, '0')}`,
      rowNumber: index + 1,
      firstName,
      middleName,
      lastName,
      fullName: [firstName, middleName, lastName].filter(Boolean).join(' ') || 'Unnamed Lead',
      email,
      phone,
      ssnTin: ssnTin || 'N/A',
      dob,
      occupation,
      visaType: valResult.normalizedVisa || visaType,
      maritalStatus,
      taxYear,
      filingType,
      addressLine1,
      city,
      state,
      zipCode,
      estimatedIncome,
      source,
      priority: normalizePriority(rawObj.priority),
      validationStatus: valResult.status,
      validationMessage: valResult.message,
    };
  });
}
