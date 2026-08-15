import type { ParsedLeadRow } from '../types/bulk-import.types';
import { validateLeadRow } from './lead-validator';

/**
 * Robust CSV & Excel HTML parser supporting comma, quote, and spreadsheet tables.
 */
export function parseCSVText(csvText: string): string[][] {
  const trimmed = csvText.trim();

  // If HTML / XML Excel format is detected
  if (trimmed.includes('<table') || trimmed.includes('<html')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'text/html');
      const tableRows = doc.querySelectorAll('tr');
      const parsedRows: string[][] = [];

      tableRows.forEach((tr) => {
        const cells = tr.querySelectorAll('th, td');
        if (cells.length > 0) {
          const row: string[] = [];
          cells.forEach((cell) => {
            row.push(cell.textContent?.trim() || '');
          });
          parsedRows.push(row);
        }
      });

      if (parsedRows.length > 0) {
        return parsedRows;
      }
    } catch (e) {
      console.warn('Fallback to standard CSV parser after HTML parse error:', e);
    }
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  // Normalize line endings
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Flush remaining cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header keys to standard property names regardless of formatting or casing
 */
function normalizeHeaderKey(header: string): string {
  const clean = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (/^(firstname|first|fname)$/.test(clean) || clean.includes('firstname')) return 'firstName';
  if (/^(middlename|middle|mname)$/.test(clean) || clean.includes('middlename') || clean.includes('middle')) return 'middleName';
  if (/^(lastname|last|lname)$/.test(clean) || clean.includes('lastname')) return 'lastName';
  if (/^(name|fullname|clientname|taxpayername)$/.test(clean) || clean.includes('taxpayer')) return 'fullName';
  if (/^(email|emailaddress|mail)$/.test(clean) || clean.includes('email')) return 'email';
  if (/^(phone|phonenumber|mobile|contact|cell)$/.test(clean) || clean.includes('phone') || clean.includes('mobile')) return 'phone';
  if (/^(ssn|tin|ssntin|taxid|ssnnumber|ssnortin)$/.test(clean) || clean.includes('ssn') || clean.includes('tin')) return 'ssnTin';
  if (/^(dob|dateofbirth|birthdate)$/.test(clean) || clean.includes('birth')) return 'dob';
  if (/^(occupation|job|profession|role)$/.test(clean) || clean.includes('occupation')) return 'occupation';
  if (/^(visatype|visa|status|visastatus)$/.test(clean) || clean.includes('visa')) return 'visaType';
  if (/^(maritalstatus|marital|married)$/.test(clean) || clean.includes('marital')) return 'maritalStatus';
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
 * Parses raw CSV into strongly typed, syntax-validated ParsedLeadRow objects
 */
export function parseCSVToLeads(csvText: string, defaultTaxYear: number = 2025): ParsedLeadRow[] {
  const rawRows = parseCSVText(csvText);
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
    const filingType = (rawObj.filingType?.toUpperCase() === 'CORPORATE' ? 'CORPORATE' : 'INDIVIDUAL') as 'INDIVIDUAL' | 'CORPORATE';
    const addressLine1 = (rawObj.addressLine1 || '').trim();
    const city = (rawObj.city || '').trim();
    const state = (rawObj.state || '').trim();
    const zipCode = (rawObj.zipCode || '').trim();
    const estimatedIncome = (rawObj.estimatedIncome || '').trim();
    const source = (rawObj.source || 'Bulk CSV Upload').trim();

    // Client-side strict validation
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
      validationStatus: valResult.status,
      validationMessage: valResult.message,
    };
  });
}

/**
 * Returns a template CSV string ready for download with distinct, clear headers
 */
export function getSampleCSVTemplate(): string {
  return `\uFEFF"First Name*","Middle Name","Last Name*","Email Address*","Phone Number*","SSN / ITIN","Date of Birth","Occupation","Visa Type","Marital Status","Tax Year","Filing Type","Street Address","City","State","Zip Code","Estimated Income","Lead Source"
"Arjun","K.","Varma","arjun.varma@gmail.com","+1 (415) 555-0142","123-45-6789","05/14/1988","Software Engineer","H-1B","Married","2025","INDIVIDUAL","742 Evergreen Terrace","Springfield","IL","62704","$145,000","Client Referral"
"Priya","","Sharma","priya.sharma@outlook.com","+1 (312) 555-0199","987-65-4321","09/22/1992","Data Scientist","F-1 OPT","Single","2025","INDIVIDUAL","1044 Michigan Ave","Chicago","IL","60611","$115,000","Google Search"
"Vikram","S.","Singhania","vikram.s@apextech.io","+1 (206) 555-0187","12-3456789","11/04/1982","VP of Engineering","L-1","Married","2025","CORPORATE","400 Pine St Suite 900","Seattle","WA","98101","$320,000","CPA Referral Partner"
"Sneha","","Patel","sneha.patel@yahoo.com","+1 (512) 555-0134","456-78-1234","03/18/1990","Financial Analyst","GREEN_CARD","Single","2025","INDIVIDUAL","1200 Congress Ave","Austin","TX","78701","$92,000","Tax Campaign 2025"
`;
}

/**
 * Generates rich realistic demo data for testing the UI preview
 */
export function getDemoLeadRows(): ParsedLeadRow[] {
  return [
    {
      id: 'LEAD-0001',
      rowNumber: 1,
      firstName: 'Arjun',
      middleName: 'K.',
      lastName: 'Varma',
      fullName: 'Arjun K. Varma',
      email: 'arjun.varma@gmail.com',
      phone: '+1 (415) 555-0142',
      ssnTin: '***-**-4912',
      dob: '05/14/1988',
      occupation: 'Software Architect',
      visaType: 'H-1B',
      maritalStatus: 'Married',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      estimatedIncome: '$165,000',
      source: 'Direct Client Referral',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0002',
      rowNumber: 2,
      firstName: 'Priya',
      middleName: '',
      lastName: 'Sharma',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@outlook.com',
      phone: '+1 (312) 555-0199',
      ssnTin: '***-**-8123',
      dob: '09/22/1992',
      occupation: 'Data Scientist',
      visaType: 'F-1 OPT',
      maritalStatus: 'Single',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '1044 Michigan Ave',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60611',
      estimatedIncome: '$115,000',
      source: 'Google Search Ads',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0003',
      rowNumber: 3,
      firstName: 'Vikram',
      middleName: 'S.',
      lastName: 'Singhania',
      fullName: 'Vikram S. Singhania',
      email: 'vikram.s@apextech.io',
      phone: '+1 (206) 555-0187',
      ssnTin: '***-**-3341',
      dob: '11/04/1982',
      occupation: 'VP of Engineering',
      visaType: 'L-1',
      maritalStatus: 'Married',
      taxYear: 2025,
      filingType: 'CORPORATE',
      addressLine1: '400 Pine St Suite 900',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      estimatedIncome: '$320,000',
      source: 'CPA Referral Network',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0004',
      rowNumber: 4,
      firstName: 'Jessica',
      middleName: '',
      lastName: 'Taylor',
      fullName: 'Jessica Taylor',
      email: 'jtaylor.design@yahoo.com',
      phone: '+1 (512) 555-0134',
      ssnTin: '***-**-9201',
      dob: '07/19/1991',
      occupation: 'UX Design Lead',
      visaType: 'US_CITIZEN',
      maritalStatus: 'Single',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '1200 Congress Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      estimatedIncome: '$98,000',
      source: 'Tax Season Outreach',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0005',
      rowNumber: 5,
      firstName: 'K',
      middleName: '',
      lastName: 'Patel',
      fullName: 'K Patel',
      email: 'k.patel@gmail.com',
      phone: '+1 (408) 555-0122',
      ssnTin: '***-**-9988',
      dob: '02/10/1985',
      occupation: 'Consultant',
      visaType: 'H-1B',
      maritalStatus: 'Married',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '100 Silicon Way',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95112',
      estimatedIncome: '$180,000',
      source: 'Referral',
      validationStatus: 'INVALID_NAME',
      validationMessage: 'First name must be at least 2 characters',
    },
    {
      id: 'LEAD-0006',
      rowNumber: 6,
      firstName: 'Rahul',
      middleName: '',
      lastName: 'Nair',
      fullName: 'Rahul Nair',
      email: 'rahul.nair@gmail.com',
      phone: '+1 (617) 555-0165',
      ssnTin: '***-**-1109',
      dob: '08/30/1989',
      occupation: 'QA Manager',
      visaType: 'INVALID_XYZ_VISA',
      maritalStatus: 'Married',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '85 Beacon St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02108',
      estimatedIncome: '$145,000',
      source: 'Direct Mailer List',
      validationStatus: 'INVALID_VISA',
      validationMessage: "Unknown Visa Type: 'INVALID_XYZ_VISA'. Allowed: H-1B, H-4, L-1, L-2, F-1 OPT, Green Card, US Citizen, etc.",
    },
  ];
}
