import type { ParsedLeadRow, LeadValidationStatus } from '../types/bulk-import.types';

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
 * Parses raw CSV into strongly typed, syntax-validated ParsedLeadRow objects
 * Note: Database deduplication is performed server-side upon ingestion.
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
    const filingType = (rawObj.filingType?.toUpperCase() === 'CORPORATE' ? 'CORPORATE' : 'INDIVIDUAL') as 'INDIVIDUAL' | 'CORPORATE';
    const addressLine1 = rawObj.addressLine1 || '';
    const city = rawObj.city || '';
    const state = rawObj.state || '';
    const zipCode = rawObj.zipCode || '';
    const estimatedIncome = rawObj.estimatedIncome || '';
    const source = rawObj.source || 'Bulk CSV Upload';

    // Client-side syntax validation
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

/**
 * Returns a template CSV string ready for download with distinct, clear headers
 */
export function getSampleCSVTemplate(): string {
  return `\uFEFF"First Name","Last Name","Email Address","Phone Number","SSN / TIN","Tax Year","Filing Type","Street Address","City","State","Zip Code","Estimated Income","Lead Source"
"Michael","Patterson","michael.p@gmail.com","+1 (415) 555-0142","123-45-6789","2025","INDIVIDUAL","742 Evergreen Terrace","Springfield","IL","62704","$85,000","Facebook Ads"
"Amanda","Rodriguez","amanda.rod@outlook.com","+1 (312) 555-0199","987-65-4321","2025","INDIVIDUAL","1044 Michigan Ave","Chicago","IL","60611","$115,000","Google Search"
"David","Kowalski","dkowalski@apextech.io","+1 (206) 555-0187","12-3456789","2025","CORPORATE","400 Pine St Suite 900","Seattle","WA","98101","$320,000","CPA Referral Partner"
"Jessica","Taylor","jtaylor.design@yahoo.com","+1 (512) 555-0134","456-78-1234","2025","INDIVIDUAL","1200 Congress Ave","Austin","TX","78701","$92,000","Tax Campaign 2025"
`;
}

/**
 * Returns a styled Excel template (.xls) with Emerald Green background (#16A34A) and 700 Bold White font
 */
export function getStyledExcelTemplate(taxYear: number = 2025): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Tax Leads Template</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  th {
    background-color: #16A34A !important;
    color: #FFFFFF !important;
    font-family: 'Poppins', Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    font-weight: 700 !important;
    text-align: left !important;
    padding: 10px 14px !important;
    border: 1px solid #15803D !important;
  }
  td {
    font-family: 'Poppins', Calibri, Arial, sans-serif !important;
    font-size: 10pt !important;
    color: #1E293B !important;
    padding: 8px 12px !important;
    border: 1px solid #CBD5E1 !important;
  }
</style>
</head>
<body>
  <table>
    <thead>
      <tr>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">First Name</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Last Name</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Email Address</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Phone Number</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">SSN / TIN</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Tax Year</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Filing Type</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Street Address</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">City</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">State</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Zip Code</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Estimated Income</th>
        <th style="background-color: #16A34A; color: #FFFFFF; font-weight: 700; border: 1px solid #15803D; padding: 10px;">Lead Source</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Michael</td>
        <td>Patterson</td>
        <td>michael.p@gmail.com</td>
        <td>+1 (415) 555-0142</td>
        <td>123-45-6789</td>
        <td>${taxYear}</td>
        <td>INDIVIDUAL</td>
        <td>742 Evergreen Terrace</td>
        <td>Springfield</td>
        <td>IL</td>
        <td>62704</td>
        <td>$85,000</td>
        <td>Facebook Campaign</td>
      </tr>
      <tr>
        <td>Amanda</td>
        <td>Rodriguez</td>
        <td>amanda.rod@outlook.com</td>
        <td>+1 (312) 555-0199</td>
        <td>987-65-4321</td>
        <td>${taxYear}</td>
        <td>INDIVIDUAL</td>
        <td>1044 Michigan Ave</td>
        <td>Chicago</td>
        <td>IL</td>
        <td>60611</td>
        <td>$115,000</td>
        <td>Google Search</td>
      </tr>
      <tr>
        <td>David</td>
        <td>Kowalski</td>
        <td>dkowalski@apextech.io</td>
        <td>+1 (206) 555-0187</td>
        <td>12-3456789</td>
        <td>${taxYear}</td>
        <td>CORPORATE</td>
        <td>400 Pine St Suite 900</td>
        <td>Seattle</td>
        <td>WA</td>
        <td>98101</td>
        <td>$320,000</td>
        <td>CPA Referral Partner</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}

/**
 * Generates rich realistic demo data for testing the UI preview
 */
export function getDemoLeadRows(): ParsedLeadRow[] {
  return [
    {
      id: 'LEAD-0001',
      rowNumber: 1,
      firstName: 'Michael',
      lastName: 'Patterson',
      fullName: 'Michael Patterson',
      email: 'michael.p@gmail.com',
      phone: '+1 (415) 555-0142',
      ssnTin: '***-**-4912',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      estimatedIncome: '$85,000',
      source: 'Facebook Ads Campaign',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0002',
      rowNumber: 2,
      firstName: 'Amanda',
      lastName: 'Rodriguez',
      fullName: 'Amanda Rodriguez',
      email: 'amanda.rod@outlook.com',
      phone: '+1 (312) 555-0199',
      ssnTin: '***-**-8123',
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
      firstName: 'David',
      lastName: 'Kowalski',
      fullName: 'David Kowalski',
      email: 'dkowalski@apextech.io',
      phone: '+1 (206) 555-0187',
      ssnTin: '***-**-3341',
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
      lastName: 'Taylor',
      fullName: 'Jessica Taylor',
      email: 'jtaylor.design@yahoo.com',
      phone: '+1 (512) 555-0134',
      ssnTin: '***-**-9201',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '1200 Congress Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      estimatedIncome: '$92,000',
      source: 'Tax Season 2025 Outreach',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0005',
      rowNumber: 5,
      firstName: 'Robert',
      lastName: 'Sterling',
      fullName: 'Robert Sterling',
      email: 'robert.sterling@gmail.com',
      phone: '+1 (617) 555-0165',
      ssnTin: '***-**-1109',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '85 Beacon St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02108',
      estimatedIncome: '$145,000',
      source: 'Direct Mailer List #14',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0006',
      rowNumber: 6,
      firstName: 'Elena',
      lastName: 'Vasquez',
      fullName: 'Elena Vasquez',
      email: 'elena.vasquez@gmail.com',
      phone: '+1 (786) 555-0120',
      ssnTin: '***-**-7745',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '200 Biscayne Blvd',
      city: 'Miami',
      state: 'FL',
      zipCode: '33132',
      estimatedIncome: '$108,000',
      source: 'Instagram Sponsored Lead',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0007',
      rowNumber: 7,
      firstName: 'Samantha',
      lastName: 'Reed',
      fullName: 'Samantha Reed',
      email: 'samantha.reed@gmail.com',
      phone: '+1 (303) 555-0111',
      ssnTin: '***-**-5561',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '1600 California St',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      estimatedIncome: '$74,000',
      source: 'Bulk CSV Ingestion',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0008',
      rowNumber: 8,
      firstName: 'Marcus',
      lastName: 'Vance',
      fullName: 'Marcus Vance',
      email: 'marcus.vance_invalid-email',
      phone: '+1 (404) 555-0177',
      ssnTin: '***-**-2290',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '350 Peachtree St NE',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30308',
      estimatedIncome: '$68,000',
      source: 'Cold List Ingestion',
      validationStatus: 'INVALID_EMAIL',
      validationMessage: 'Invalid or missing email format',
    },
    {
      id: 'LEAD-0009',
      rowNumber: 9,
      firstName: 'Katherine',
      lastName: 'Chen',
      fullName: 'Katherine Chen',
      email: 'k.chen@biovanguard.com',
      phone: '+1 (858) 555-0144',
      ssnTin: '***-**-9812',
      taxYear: 2025,
      filingType: 'CORPORATE',
      addressLine1: '10200 Torrey Pines Rd',
      city: 'La Jolla',
      state: 'CA',
      zipCode: '92037',
      estimatedIncome: '$490,000',
      source: 'Corporate Referral',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0010',
      rowNumber: 10,
      firstName: 'Christopher',
      lastName: 'Walsh',
      fullName: 'Christopher Walsh',
      email: 'cwalsh@phoenixbuild.net',
      phone: '',
      ssnTin: '***-**-6043',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '2400 E Camelback Rd',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85016',
      estimatedIncome: '$95,000',
      source: 'Website Form Lead',
      validationStatus: 'INVALID_PHONE',
      validationMessage: 'Invalid contact phone number',
    },
    {
      id: 'LEAD-0011',
      rowNumber: 11,
      firstName: 'Sophia',
      lastName: 'Martinez',
      fullName: 'Sophia Martinez',
      email: 'smartinez@solardynamics.io',
      phone: '+1 (702) 555-0198',
      ssnTin: '***-**-3341',
      taxYear: 2025,
      filingType: 'CORPORATE',
      addressLine1: '3883 Howard Hughes Pkwy',
      city: 'Las Vegas',
      state: 'NV',
      zipCode: '89169',
      estimatedIncome: '$280,000',
      source: 'B2B Trade Show',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
    {
      id: 'LEAD-0012',
      rowNumber: 12,
      firstName: 'Brian',
      lastName: 'O’Connor',
      fullName: 'Brian O’Connor',
      email: 'brian.oc@verizon.net',
      phone: '+1 (215) 555-0132',
      ssnTin: '***-**-8420',
      taxYear: 2025,
      filingType: 'INDIVIDUAL',
      addressLine1: '1800 JFK Blvd',
      city: 'Philadelphia',
      state: 'PA',
      zipCode: '19103',
      estimatedIncome: '$88,000',
      source: 'Referral Program',
      validationStatus: 'VALID',
      validationMessage: 'Valid & ready for server ingest',
    },
  ];
}
