import ExcelJS from 'exceljs';
import type { ParsedLeadRow, LeadValidationStatus } from '../types/bulk-import.types';

/**
 * Generates and downloads a native Excel (.xlsx) file with Emerald Green background (#16A34A) and Bold 700 font
 */
export async function downloadStyledExcelTemplate(taxYear: number = 2025): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TaxCRM Engine';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`Tax Leads TY${taxYear}`, {
    views: [{ showGridLines: true }],
  });

  // Define columns with generous widths to prevent text clipping in Excel
  worksheet.columns = [
    { header: 'First Name', key: 'firstName', width: 18 },
    { header: 'Last Name', key: 'lastName', width: 18 },
    { header: 'Email Address', key: 'email', width: 28 },
    { header: 'Phone Number', key: 'phone', width: 22 },
    { header: 'SSN / TIN', key: 'ssnTin', width: 18 },
    { header: 'Tax Year', key: 'taxYear', width: 14 },
    { header: 'Filing Type', key: 'filingType', width: 18 },
    { header: 'Street Address', key: 'addressLine1', width: 30 },
    { header: 'City', key: 'city', width: 18 },
    { header: 'State', key: 'state', width: 12 },
    { header: 'Zip Code', key: 'zipCode', width: 14 },
    { header: 'Estimated Income', key: 'estimatedIncome', width: 20 },
    { header: 'Lead Source', key: 'source', width: 24 },
  ];

  // Style Header Row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 32;

  headerRow.eachCell((cell) => {
    // Background Fill: Tax Emerald Green #16A34A
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF16A34A' },
    };

    // Font: 700 Bold, Size 11, White Text
    cell.font = {
      name: 'Poppins',
      family: 2,
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };

    // Alignment: Centered vertically and horizontally
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };

    // Solid border around header cells
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF15803D' } },
      left: { style: 'thin', color: { argb: 'FF15803D' } },
      bottom: { style: 'medium', color: { argb: 'FF15803D' } },
      right: { style: 'thin', color: { argb: 'FF15803D' } },
    };
  });

  // Sample data rows
  const sampleData = [
    {
      firstName: 'Michael',
      lastName: 'Patterson',
      email: 'michael.p@gmail.com',
      phone: '+1 (415) 555-0142',
      ssnTin: '123-45-6789',
      taxYear: taxYear,
      filingType: 'INDIVIDUAL',
      addressLine1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      estimatedIncome: '$85,000',
      source: 'Facebook Ads',
    },
    {
      firstName: 'Amanda',
      lastName: 'Rodriguez',
      email: 'amanda.rod@outlook.com',
      phone: '+1 (312) 555-0199',
      ssnTin: '987-65-4321',
      taxYear: taxYear,
      filingType: 'INDIVIDUAL',
      addressLine1: '1044 Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60611',
      estimatedIncome: '$115,000',
      source: 'Google Search',
    },
    {
      firstName: 'David',
      lastName: 'Kowalski',
      email: 'dkowalski@apextech.io',
      phone: '+1 (206) 555-0187',
      ssnTin: '12-3456789',
      taxYear: taxYear,
      filingType: 'CORPORATE',
      addressLine1: '400 Pine St Suite 900',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      estimatedIncome: '$320,000',
      source: 'CPA Referral Partner',
    },
    {
      firstName: 'Jessica',
      lastName: 'Taylor',
      email: 'jtaylor.design@yahoo.com',
      phone: '+1 (512) 555-0134',
      ssnTin: '456-78-1234',
      taxYear: taxYear,
      filingType: 'INDIVIDUAL',
      addressLine1: '1200 Congress Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      estimatedIncome: '$92,000',
      source: 'Tax Campaign 2025',
    },
  ];

  // Add rows & style them
  sampleData.forEach((item, index) => {
    const row = worksheet.addRow(item);
    row.height = 24;

    const isEven = index % 2 === 1;
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: 'Poppins',
        size: 10,
        color: { argb: 'FF1E293B' },
      };

      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 6 || colNumber === 7 || colNumber === 10 ? 'center' : 'left',
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
  link.setAttribute('download', `tax_lead_template_${taxYear}.xlsx`);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Normalizes header keys to standard property names
 */
function normalizeHeaderKey(header: string): string {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/^(firstname|first|fname)$/.test(clean) || clean.includes('firstname')) return 'firstName';
  if (/^(lastname|last|lname)$/.test(clean) || clean.includes('lastname')) return 'lastName';
  if (/^(name|fullname|clientname|taxpayername)$/.test(clean) || clean.includes('taxpayer')) return 'fullName';
  if (/^(email|emailaddress|mail)$/.test(clean) || clean.includes('email')) return 'email';
  if (/^(phone|phonenumber|mobile|contact|cell)$/.test(clean) || clean.includes('phone') || clean.includes('mobile')) return 'phone';
  if (/^(ssn|tin|ssntin|taxid|ssnnumber|ssnortin)$/.test(clean) || clean.includes('ssn') || clean.includes('tin')) return 'ssnTin';
  if (/^(taxyear|year|filingyear)$/.test(clean) || clean.includes('year')) return 'taxYear';
  if (/^(filingtype|type|category)$/.test(clean) || clean.includes('filingtype')) return 'filingType';
  if (/^(address|addressline1|street|streetaddress|addressline)$/.test(clean) || clean.includes('address') || clean.includes('street')) return 'addressLine1';
  if (/^(city|town)$/.test(clean) || clean.includes('city')) return 'city';
  if (/^(state|province)$/.test(clean) || clean.includes('state')) return 'state';
  if (/^(zip|zipcode|postal|postalcode)$/.test(clean) || clean.includes('zip') || clean.includes('postal')) return 'zipCode';
  if (/^(income|estimatedincome|w2income|grossincome)$/.test(clean) || clean.includes('income')) return 'estimatedIncome';
  if (/^(source|campaign|channel|leadsource)$/.test(clean) || clean.includes('source') || clean.includes('campaign')) return 'source';
  return clean;
}

/**
 * Parses native Excel (.xlsx / .xls) buffer into ParsedLeadRow array
 */
export async function parseExcelFileBuffer(
  arrayBuffer: ArrayBuffer,
  defaultTaxYear: number = 2025
): Promise<ParsedLeadRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const rawRows: string[][] = [];
  worksheet.eachRow((row) => {
    const rowValues: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      let val = '';
      if (cell.value !== null && cell.value !== undefined) {
        if (typeof cell.value === 'object') {
          val = (cell.value as any).text || (cell.value as any).result || String(cell.value);
        } else {
          val = String(cell.value);
        }
      }
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

    let firstName = rawObj.firstName || '';
    let lastName = rawObj.lastName || '';
    if (!firstName && rawObj.fullName) {
      const parts = rawObj.fullName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    const email = (rawObj.email || '').trim().toLowerCase();
    const phone = (rawObj.phone || '').trim();
    const ssnTin = (rawObj.ssnTin || '').trim();
    const parsedYear = parseInt(rawObj.taxYear, 10);
    const taxYear = !isNaN(parsedYear) && parsedYear > 2000 ? parsedYear : defaultTaxYear;
    const filingType = (
      rawObj.filingType?.toUpperCase() === 'CORPORATE' ? 'CORPORATE' : 'INDIVIDUAL'
    ) as 'INDIVIDUAL' | 'CORPORATE';
    const addressLine1 = rawObj.addressLine1 || '';
    const city = rawObj.city || '';
    const state = rawObj.state || '';
    const zipCode = rawObj.zipCode || '';
    const estimatedIncome = rawObj.estimatedIncome || '';
    const source = rawObj.source || 'Excel Import';

    let validationStatus: LeadValidationStatus = 'VALID';
    let validationMessage = 'Valid & ready for server ingest';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      validationStatus = 'INVALID_EMAIL';
      validationMessage = 'Invalid or missing email syntax';
    } else if (!phone || phone.replace(/\D/g, '').length < 7) {
      validationStatus = 'INVALID_PHONE';
      validationMessage = 'Invalid contact phone number';
    } else if (!firstName && !lastName && !rawObj.fullName) {
      validationStatus = 'MISSING_DATA';
      validationMessage = 'Missing taxpayer name';
    }

    return {
      id: `LEAD-${String(index + 1).padStart(4, '0')}`,
      rowNumber: index + 1,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || 'Unnamed Lead',
      email,
      phone,
      ssnTin: ssnTin || 'N/A',
      taxYear,
      filingType,
      addressLine1,
      city,
      state,
      zipCode,
      estimatedIncome,
      source,
      validationStatus,
      validationMessage,
    };
  });
}
