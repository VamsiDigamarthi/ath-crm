import { type OrganizerData } from '../../../services/customer-api';
import { parseUsDate } from './organizer-date-helpers';

export type ValidationErrorMap = Record<string, string>;

/**
 * Detects XSS vectors, HTML tags, script injection attempts, and dangerous characters
 */
export const containsXssOrHtml = (val?: string | null): boolean => {
  if (!val || typeof val !== 'string') return false;
  const htmlTagPattern = /<[^>]+>|<\s*script\b|javascript\s*:|on\w+\s*=/i;
  return htmlTagPattern.test(val);
};

/**
 * Checks if a parsed date is strictly in the future (after today)
 */
export const isFutureDate = (dateStr?: string | null): boolean => {
  if (!dateStr) return false;
  const parsed = parseUsDate(dateStr);
  if (!parsed || isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return parsed > today;
};

/**
 * Validates Module 1: Personal Info & Demographics
 */
export const validateModule1 = (data?: OrganizerData['m1_demographics']): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) {
    return { firstName: 'Personal Information is required' };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // 1. First Name
  const first = (data.firstName || data.fullName?.split(' ')[0] || '').trim();
  if (!first) {
    errors.firstName = 'First Name is required as per SSN';
  } else if (first.length < 2) {
    errors.firstName = 'First Name must be at least 2 characters';
  }

  // 2. Last Name
  const last = (data.lastName || data.fullName?.split(' ').slice(1).join(' ') || '').trim();
  if (!last) {
    errors.lastName = 'Last Name is required as per SSN';
  } else if (last.length < 2) {
    errors.lastName = 'Last Name must be at least 2 characters';
  }

  // 3. Date of Birth
  const dob = (data.dob || '').trim();
  if (!dob) {
    errors.dob = 'Date of Birth is required (MM/DD/YYYY)';
  } else {
    const dobDate = parseUsDate(dob);
    if (!dobDate || isNaN(dobDate.getTime())) {
      errors.dob = 'Please enter a valid Date of Birth (MM/DD/YYYY)';
    } else if (dobDate > today) {
      errors.dob = 'Date of Birth cannot be in the future!';
    } else if (dobDate.getFullYear() < 1900) {
      errors.dob = 'Please enter a valid birth year (1900 or later)';
    }
  }

  // 4. SSN / ITIN
  const ssn = (data.ssnMasked || '').trim();
  if (!ssn) {
    errors.ssnMasked = 'SSN or ITIN is required';
  } else if (!ssn.includes('•')) {
    const rawSsn = ssn.replace(/\D/g, '');
    if (rawSsn.length !== 9) {
      errors.ssnMasked = 'SSN / ITIN must be 9 digits (e.g. 123-45-6789)';
    }
  }

  // 5. Occupation
  const occupation = (data.occupation || '').trim();
  if (!occupation) {
    errors.occupation = 'Occupation is required (e.g. Software Engineer)';
  }

  // 6. Mobile Phone
  const phone = (data.phone || '').trim();
  if (!phone) {
    errors.phone = 'Mobile Phone Number is required';
  } else if (phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  // 7. Email Address
  const email = (data.email || '').trim();
  if (!email) {
    errors.email = 'Email Address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address (e.g. name@domain.com)';
  }

  // 8. First Port of Entry Date
  const portEntry = (data.firstPortOfEntryDate || '').trim();
  if (!portEntry) {
    errors.firstPortOfEntryDate = 'First port of entry date in the US is required';
  } else {
    const entryDate = parseUsDate(portEntry);
    if (entryDate && entryDate > today) {
      errors.firstPortOfEntryDate = 'First port of entry date cannot be in the future!';
    }
  }

  // 9. Total Months Stayed in US
  if (data.monthsStayedInUs2025 === undefined || data.monthsStayedInUs2025 === null) {
    errors.monthsStayedInUs2025 = 'Total months stayed in US during tax year is required';
  } else if (data.monthsStayedInUs2025 < 0 || data.monthsStayedInUs2025 > 12) {
    errors.monthsStayedInUs2025 = 'Months stayed must be between 0 and 12';
  }

  // 10. Residential Street Address
  const address = (data.residentialAddress || '').trim();
  if (!address) {
    errors.residentialAddress = 'Current residential street address is required';
  } else if (address.length < 5) {
    errors.residentialAddress = 'Please enter a full street address';
  }

  // 11. City
  const city = (data.city || '').trim();
  if (!city) {
    errors.city = 'City is required';
  }

  // 12. State
  const state = (data.state || '').trim();
  if (!state) {
    errors.state = 'State is required';
  } else if (state.length !== 2) {
    errors.state = 'State must be a 2-letter code (e.g. TX, CA)';
  }

  // 13. ZIP Code
  const zip = (data.zipCode || '').trim();
  if (!zip) {
    errors.zipCode = 'ZIP Code is required';
  } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    errors.zipCode = 'Please enter a valid 5-digit US ZIP code (e.g. 77002)';
  }

  // 14. Marriage Date (if married)
  if (data.maritalStatus?.includes('Married')) {
    if (!data.dateOfMarriage || !data.dateOfMarriage.trim()) {
      errors.dateOfMarriage = 'Date of marriage is required for married filing status';
    } else {
      const marriageDate = parseUsDate(data.dateOfMarriage);
      if (!marriageDate || isNaN(marriageDate.getTime())) {
        errors.dateOfMarriage = 'Please enter a valid Date of Marriage (MM/DD/YYYY)';
      } else if (marriageDate > today) {
        errors.dateOfMarriage = 'Date of Marriage cannot be a future date!';
      } else if (data.dob) {
        const dobDate = parseUsDate(data.dob);
        if (dobDate && marriageDate <= dobDate) {
          errors.dateOfMarriage = 'Date of Marriage must be after your Date of Birth';
        }
      }
    }
  }

  // 15. Visa Status Change Date (if changed)
  if (data.visaStatusChanged2025 === 'YES') {
    if (!data.visaChangeDate || !data.visaChangeDate.trim()) {
      errors.visaChangeDate = 'Date of VISA status change is required';
    } else {
      const vDate = parseUsDate(data.visaChangeDate);
      if (vDate && vDate > today) {
        errors.visaChangeDate = 'VISA status change date cannot be a future date!';
      }
    }
  }

  return errors;
};

/**
 * Validates Module 2: Spouse, Dependents & Daycare
 */
export const validateModule2 = (
  data?: OrganizerData['m2_dependents'],
  maritalStatus?: string
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const spouses = data.spouseList && data.spouseList.length > 0
    ? data.spouseList
    : (data.spouseFirstName || data.spouseName ? [{
        firstName: data.spouseFirstName || data.spouseName?.split(' ')[0] || '',
        middleName: data.spouseMiddleName || '',
        lastName: data.spouseLastName || data.spouseName?.split(' ').slice(1).join(' ') || '',
        dob: data.spouseDob || '',
        ssn: data.spouseSsn || '',
        occupation: data.spouseOccupation || '',
        visaType: data.spouseVisaType || 'H-4 EAD',
        workPhone: data.spouseWorkPhone || '',
        email: data.spouseEmail || '',
        relationship: data.spouseRelationship || 'Spouse',
      }] : []);

  // 1. If filing as Married, require at least 1 Spouse record
  if (maritalStatus?.includes('Married') && spouses.length === 0) {
    errors.spouse_general = 'Spouse details are required for Married filing status. Please click "+ Add Spouse Details".';
  }

  // 2. Validate each spouse entry
  spouses.forEach((sp, idx) => {
    const first = (sp.firstName || '').trim();
    if (!first) {
      errors[`spouse_${idx}_firstName`] = 'Spouse First Name is required as per SSN';
    } else if (first.length < 2) {
      errors[`spouse_${idx}_firstName`] = 'Spouse First Name must be at least 2 characters';
    }

    const last = (sp.lastName || '').trim();
    if (!last) {
      errors[`spouse_${idx}_lastName`] = 'Spouse Last Name is required as per SSN';
    } else if (last.length < 2) {
      errors[`spouse_${idx}_lastName`] = 'Spouse Last Name must be at least 2 characters';
    }

    const dob = (sp.dob || '').trim();
    if (!dob) {
      errors[`spouse_${idx}_dob`] = 'Spouse Date of Birth is required (MM/DD/YYYY)';
    } else {
      const dobDate = parseUsDate(dob);
      if (!dobDate || isNaN(dobDate.getTime())) {
        errors[`spouse_${idx}_dob`] = 'Please enter a valid date (MM/DD/YYYY)';
      } else if (dobDate > today) {
        errors[`spouse_${idx}_dob`] = 'Spouse Date of Birth cannot be in the future!';
      } else if (dobDate.getFullYear() < 1900) {
        errors[`spouse_${idx}_dob`] = 'Please enter a valid birth year (1900 or later)';
      }
    }

    const ssn = (sp.ssn || '').trim();
    if (!ssn) {
      errors[`spouse_${idx}_ssn`] = 'Spouse SSN / ITIN is required';
    } else if (!ssn.includes('•')) {
      const rawSsn = ssn.replace(/\D/g, '');
      if (rawSsn.length !== 9) {
        errors[`spouse_${idx}_ssn`] = 'Spouse SSN must be 9 digits (e.g. 123-45-6789)';
      }
    }

    const occupation = (sp.occupation || '').trim();
    if (!occupation) {
      errors[`spouse_${idx}_occupation`] = 'Spouse Occupation is required (e.g. Financial Analyst or Homemaker)';
    }
  });

  // 3. Validate each dependent entry
  const dependents = data.dependentsList || [];
  dependents.forEach((dep, idx) => {
    const first = (dep.firstName || dep.name?.split(' ')[0] || '').trim();
    if (!first) {
      errors[`dep_${idx}_firstName`] = 'Dependent First Name is required as per SSN';
    } else if (first.length < 2) {
      errors[`dep_${idx}_firstName`] = 'Dependent First Name must be at least 2 characters';
    }

    const last = (dep.lastName || dep.name?.split(' ').slice(1).join(' ') || '').trim();
    if (!last) {
      errors[`dep_${idx}_lastName`] = 'Dependent Last Name is required as per SSN';
    } else if (last.length < 2) {
      errors[`dep_${idx}_lastName`] = 'Dependent Last Name must be at least 2 characters';
    }

    const dob = (dep.dob || '').trim();
    if (!dob) {
      errors[`dep_${idx}_dob`] = 'Dependent Date of Birth is required (MM/DD/YYYY)';
    } else {
      const dobDate = parseUsDate(dob);
      if (!dobDate || isNaN(dobDate.getTime())) {
        errors[`dep_${idx}_dob`] = 'Please enter a valid date (MM/DD/YYYY)';
      } else if (dobDate > today) {
        errors[`dep_${idx}_dob`] = 'Dependent Date of Birth cannot be in the future!';
      } else if (dobDate.getFullYear() < 1900) {
        errors[`dep_${idx}_dob`] = 'Please enter a valid birth year (1900 or later)';
      }
    }

    const ssn = (dep.ssn || '').trim();
    if (!ssn) {
      errors[`dep_${idx}_ssn`] = 'Dependent SSN / ITIN is required';
    } else if (!ssn.includes('•')) {
      const rawSsn = ssn.replace(/\D/g, '');
      if (rawSsn.length !== 9) {
        errors[`dep_${idx}_ssn`] = 'SSN must be 9 digits (e.g. 123-45-6789)';
      }
    }

    if (dep.monthsInHome === undefined || dep.monthsInHome === null) {
      errors[`dep_${idx}_monthsInHome`] = 'Months lived in home is required (0-12)';
    } else if (dep.monthsInHome < 0 || dep.monthsInHome > 12) {
      errors[`dep_${idx}_monthsInHome`] = 'Months lived in home must be between 0 and 12';
    }
  });

  // 4. Validate Daycare list entries
  const daycareList = data.daycareList || [];
  daycareList.forEach((care, idx) => {
    const depName = (care.dependentName || '').trim();
    if (!depName) {
      errors[`daycare_${idx}_dependentName`] = 'Dependent name is required';
    }

    const provName = (care.providerName || '').trim();
    if (!provName) {
      errors[`daycare_${idx}_providerName`] = 'Daycare Provider / Facility name is required';
    } else if (provName.length < 2) {
      errors[`daycare_${idx}_providerName`] = 'Provider name must be at least 2 characters';
    }

    const ein = (care.providerEinSsn || '').trim();
    if (!ein) {
      errors[`daycare_${idx}_providerEinSsn`] = 'Provider EIN or SSN is required for Form 2441 credit';
    }

    const address = (care.providerAddress || '').trim();
    if (!address) {
      errors[`daycare_${idx}_providerAddress`] = 'Provider address is required';
    } else if (address.length < 5) {
      errors[`daycare_${idx}_providerAddress`] = 'Please provide full provider street address';
    }

    if (!care.amountPaid || care.amountPaid <= 0) {
      errors[`daycare_${idx}_amountPaid`] = 'Please enter total amount paid to daycare ($)';
    }
  });

  return errors;
};

/**
 * Helper to check leap year
 */
export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Validates Module 3: Substantial Presence & Multi-State
 */
export const validateModule3 = (
  data?: OrganizerData['m3_presence'],
  selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  // 1. Current Tax Year Days (e.g. 2025)
  const maxCurrentDays = isLeapYear(selectedTaxYear) ? 366 : 365;
  if (data.days2025 === undefined || data.days2025 === null) {
    errors.days2025 = `TY ${selectedTaxYear} days in U.S. is required (0 to ${maxCurrentDays})`;
  } else if (isNaN(data.days2025) || data.days2025 < 0) {
    errors.days2025 = `Days cannot be negative (min: 0)`;
  } else if (data.days2025 > maxCurrentDays) {
    errors.days2025 = `Days in ${selectedTaxYear} cannot exceed ${maxCurrentDays} days!`;
  }

  // 2. Prior Year 1 Days (e.g. 2024)
  const maxPrior1Days = isLeapYear(selectedTaxYear - 1) ? 366 : 365;
  if (data.days2024 === undefined || data.days2024 === null) {
    errors.days2024 = `TY ${selectedTaxYear - 1} days in U.S. is required (0 to ${maxPrior1Days})`;
  } else if (isNaN(data.days2024) || data.days2024 < 0) {
    errors.days2024 = `Days cannot be negative (min: 0)`;
  } else if (data.days2024 > maxPrior1Days) {
    errors.days2024 = `Days in ${selectedTaxYear - 1} cannot exceed ${maxPrior1Days} days!`;
  }

  // 3. Prior Year 2 Days (e.g. 2023)
  const maxPrior2Days = isLeapYear(selectedTaxYear - 2) ? 366 : 365;
  if (data.days2023 === undefined || data.days2023 === null) {
    errors.days2023 = `TY ${selectedTaxYear - 2} days in U.S. is required (0 to ${maxPrior2Days})`;
  } else if (isNaN(data.days2023) || data.days2023 < 0) {
    errors.days2023 = `Days cannot be negative (min: 0)`;
  } else if (data.days2023 > maxPrior2Days) {
    errors.days2023 = `Days in ${selectedTaxYear - 2} cannot exceed ${maxPrior2Days} days!`;
  }

  // 4. Multi-State Residing History Rows
  const historyList = data.statesResidedHistory || [];
  historyList.forEach((row, idx) => {
    const st = (row.state || '').trim();
    if (!st) {
      errors[`state_${idx}_state`] = 'Taxpayer State is required (e.g. TX, CA, NY)';
    } else if (st.length > 2) {
      errors[`state_${idx}_state`] = 'Please enter 2-letter state code (e.g. TX)';
    }

    if (!row.fromDate || !row.fromDate.trim()) {
      errors[`state_${idx}_fromDate`] = 'Taxpayer From date is required (MM/DD/YYYY)';
    } else {
      const fromD = parseUsDate(row.fromDate);
      if (!fromD || isNaN(fromD.getTime())) {
        errors[`state_${idx}_fromDate`] = 'Enter valid From date (MM/DD/YYYY)';
      }
    }

    if (!row.toDate || !row.toDate.trim()) {
      errors[`state_${idx}_toDate`] = 'Taxpayer To date is required (MM/DD/YYYY)';
    } else {
      const toD = parseUsDate(row.toDate);
      if (!toD || isNaN(toD.getTime())) {
        errors[`state_${idx}_toDate`] = 'Enter valid To date (MM/DD/YYYY)';
      }
    }

    if (row.fromDate && row.toDate) {
      const fromD = parseUsDate(row.fromDate);
      const toD = parseUsDate(row.toDate);
      if (fromD && toD && fromD > toD) {
        errors[`state_${idx}_toDate`] = 'To Date cannot be before From Date';
      }
    }

    // Spouse residency validation (optional, but validate if entered)
    if (row.spouseFromDate) {
      const sFromD = parseUsDate(row.spouseFromDate);
      if (!sFromD || isNaN(sFromD.getTime())) {
        errors[`state_${idx}_spouseFromDate`] = 'Enter valid spouse From date (MM/DD/YYYY)';
      }
    }

    if (row.spouseToDate) {
      const sToD = parseUsDate(row.spouseToDate);
      if (!sToD || isNaN(sToD.getTime())) {
        errors[`state_${idx}_spouseToDate`] = 'Enter valid spouse To date (MM/DD/YYYY)';
      }
    }

    if (row.spouseFromDate && row.spouseToDate) {
      const sFromD = parseUsDate(row.spouseFromDate);
      const sToD = parseUsDate(row.spouseToDate);
      if (sFromD && sToD && sFromD > sToD) {
        errors[`state_${idx}_spouseToDate`] = 'Spouse To Date cannot be before From Date';
      }
    }
  });

  return errors;
};

/**
 * Validates Module 4: W-2 Wages & Rental Properties
 */
export const validateModule4 = (
  data?: OrganizerData['m4_wages'],
  _selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  // 1. Primary Employer Name
  const empName = (data.employerName || '').trim();
  if (!empName) {
    errors.employerName = 'Primary Employer Name is required (as listed on Form W-2)';
  } else if (empName.length < 2) {
    errors.employerName = 'Employer name must be at least 2 characters';
  }

  // 2. Box 1 Estimated Total Wages
  if (data.estimatedWages === undefined || data.estimatedWages === null) {
    errors.estimatedWages = 'Box 1 Total Wages ($) is required (as listed on Form W-2)';
  } else if (isNaN(data.estimatedWages) || data.estimatedWages <= 0) {
    errors.estimatedWages = 'Total Wages must be greater than $0';
  }

  // 3. Rental Properties Validation
  const rentals = data.rentalProperties || [];
  rentals.forEach((prop, idx) => {
    const addr = (prop.address || '').trim();
    if (!addr) {
      errors[`rental_${idx}_address`] = 'Rental property address is required';
    } else if (addr.length < 5) {
      errors[`rental_${idx}_address`] = 'Please enter full property address with street & city';
    }

    if (prop.totalRentalIncome === undefined || prop.totalRentalIncome === null || isNaN(prop.totalRentalIncome)) {
      errors[`rental_${idx}_totalRentalIncome`] = 'Total Rental Income received ($) is required (enter 0 if none)';
    } else if (prop.totalRentalIncome < 0) {
      errors[`rental_${idx}_totalRentalIncome`] = 'Rental income cannot be negative';
    }

    if (prop.monthsRented2025 !== undefined && (prop.monthsRented2025 < 0 || prop.monthsRented2025 > 12)) {
      errors[`rental_${idx}_monthsRented2025`] = 'Months rented must be between 0 and 12';
    }

    if (prop.personalMonths2025 !== undefined && (prop.personalMonths2025 < 0 || prop.personalMonths2025 > 12)) {
      errors[`rental_${idx}_personalMonths2025`] = 'Personal months used must be between 0 and 12';
    }

    if (prop.purchaseDate) {
      const pDate = parseUsDate(prop.purchaseDate);
      if (!pDate || isNaN(pDate.getTime())) {
        errors[`rental_${idx}_purchaseDate`] = 'Enter valid purchase date (MM/DD/YYYY)';
      } else if (pDate > new Date()) {
        errors[`rental_${idx}_purchaseDate`] = 'Property purchase date cannot be a future date!';
      }
    }
  });

  return errors;
};

/**
 * Validates Module 5: 1099-INT / DIV / OID Interest & Dividends
 * Note: Module 5 is optional, but if amounts are entered, non-negative numbers and clean bank names are strictly enforced.
 */
export const validateModule5 = (
  data?: OrganizerData['m5_interest'],
  _selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  // 1. Bank / Payer Name XSS & Content Validation
  const bank = (data.bankName || '').trim();
  if (bank) {
    if (containsXssOrHtml(bank)) {
      errors.bankName = 'HTML tags or script injections are strictly forbidden!';
    } else if (bank.length < 2) {
      errors.bankName = 'Bank name must be at least 2 characters';
    }
  }

  // 2. Interest Amount Validation
  if (data.interestAmount !== undefined && data.interestAmount !== null) {
    if (isNaN(data.interestAmount) || data.interestAmount < 0) {
      errors.interestAmount = 'Interest income cannot be negative';
    } else if (data.interestAmount > 0 && !bank) {
      errors.bankName = 'Bank name is required when interest income is reported';
    }
  }

  // 3. Dividend Amount Validation
  if (data.dividendAmount !== undefined && data.dividendAmount !== null) {
    if (isNaN(data.dividendAmount) || data.dividendAmount < 0) {
      errors.dividendAmount = 'Dividend income cannot be negative';
    }
  }

  // 4. 1099-OID Amount Validation
  if (data.form1099OidAmount !== undefined && data.form1099OidAmount !== null) {
    if (isNaN(data.form1099OidAmount) || data.form1099OidAmount < 0) {
      errors.form1099OidAmount = '1099-OID amount cannot be negative';
    }
  }

  return errors;
};

/**
 * Validates Module 6: 1099-B Stocks, ESPP, RSU & Capital Losses
 * Note: Module 6 is optional, but if brokerage platforms or gains/losses are entered, they are strictly validated.
 */
export const validateModule6 = (
  data?: OrganizerData['m6_stocks'],
  _selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  // 1. Validate Brokerage Platforms in stocksList
  const stocks = data.stocksList || [];
  stocks.forEach((stk, idx) => {
    const bName = (stk.brokerName || '').trim();
    if (!bName) {
      errors[`stock_${idx}_brokerName`] = 'Broker / Platform Name is required (e.g. Robinhood, Fidelity, Zerodha)';
    } else if (containsXssOrHtml(bName)) {
      errors[`stock_${idx}_brokerName`] = 'HTML tags or script injections are strictly forbidden!';
    } else if (bName.length < 2) {
      errors[`stock_${idx}_brokerName`] = 'Broker name must be at least 2 characters';
    }
  });

  // 2. Validate ESPP / RSU details if entered
  if (data.esppRsuDetails && containsXssOrHtml(data.esppRsuDetails)) {
    errors.esppRsuDetails = 'HTML tags or script injections are strictly forbidden!';
  }

  // 3. Loss Carryforwards must be non-negative (>= 0)
  if (data.lossCarryforwardTaxpayer !== undefined && (isNaN(data.lossCarryforwardTaxpayer) || data.lossCarryforwardTaxpayer < 0)) {
    errors.lossCarryforwardTaxpayer = 'Loss carryforward must be a non-negative number ($0 or greater)';
  }
  if (data.lossCarryforwardSpouse !== undefined && (isNaN(data.lossCarryforwardSpouse) || data.lossCarryforwardSpouse < 0)) {
    errors.lossCarryforwardSpouse = 'Loss carryforward must be a non-negative number ($0 or greater)';
  }

  return errors;
};

/**
 * Validates Module 7: FBAR / FATCA & Indian Income (INR)
 * Note: Module 7 is optional, but if Indian accounts or income are reported, they are strictly validated.
 */
export const validateModule7 = (
  data?: OrganizerData['m7_foreign'],
  _selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  // 1. Check XSS in otherForeignIncomeSource
  if (data.otherForeignIncomeSource && containsXssOrHtml(data.otherForeignIncomeSource)) {
    errors.otherForeignIncomeSource = 'HTML tags or script injections are strictly forbidden!';
  }

  // 2. Validate Foreign Accounts if FBAR is YES or accounts are present
  const accounts = data.foreignAccountsList || [];
  accounts.forEach((acc, idx) => {
    const bName = (acc.bankName || '').trim();
    if (!bName) {
      errors[`foreignAcc_${idx}_bankName`] = 'Indian Bank / Institution Name is required (e.g. HDFC, SBI, ICICI)';
    } else if (containsXssOrHtml(bName)) {
      errors[`foreignAcc_${idx}_bankName`] = 'HTML tags or script injections are strictly forbidden!';
    } else if (bName.length < 2) {
      errors[`foreignAcc_${idx}_bankName`] = 'Bank name must be at least 2 characters';
    }

    if (acc.maxBalanceInr !== undefined && (isNaN(acc.maxBalanceInr) || acc.maxBalanceInr < 0)) {
      errors[`foreignAcc_${idx}_maxBalanceInr`] = 'Max balance cannot be negative';
    }
  });

  // 3. Non-negative checks on INR Income amounts
  if (data.foreignSalaryInr !== undefined && (isNaN(data.foreignSalaryInr) || data.foreignSalaryInr < 0)) {
    errors.foreignSalaryInr = 'Salary income cannot be negative';
  }
  if (data.foreignInterestInr !== undefined && (isNaN(data.foreignInterestInr) || data.foreignInterestInr < 0)) {
    errors.foreignInterestInr = 'Interest income cannot be negative';
  }
  if (data.foreignDividendInr !== undefined && (isNaN(data.foreignDividendInr) || data.foreignDividendInr < 0)) {
    errors.foreignDividendInr = 'Dividend income cannot be negative';
  }
  if (data.foreignRentalInr !== undefined && (isNaN(data.foreignRentalInr) || data.foreignRentalInr < 0)) {
    errors.foreignRentalInr = 'Rental income cannot be negative';
  }
  if (data.foreignTaxesPaidInr !== undefined && (isNaN(data.foreignTaxesPaidInr) || data.foreignTaxesPaidInr < 0)) {
    errors.foreignTaxesPaidInr = 'TDS / Foreign tax paid cannot be negative';
  }

  return errors;
};

/**
 * Validates Module 8: Itemized Deductions, State Rent & Solar Energy
 * Note: Module 8 is optional, but if rent rows or expenses are entered, strict state uniqueness, 12-month limit, and non-negative amounts are enforced.
 */
export const validateModule8 = (
  data?: OrganizerData['m8_deductions'],
  _selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  // 1. Validate State Rental Deductions
  const rentList = data.rentDeductionsList || [];
  const seenStates = new Set<string>();
  let totalMonths = 0;

  rentList.forEach((rent, idx) => {
    const st = (rent.state || '').trim();
    if (st) {
      if (seenStates.has(st)) {
        errors[`rent_${idx}_state`] = 'Duplicate state selected! Each state can only be listed once.';
      } else {
        seenStates.add(st);
      }
    }

    const months = rent.months || 0;
    totalMonths += months;
    if (months < 0 || months > 12) {
      errors[`rent_${idx}_months`] = 'Rental months must be between 1 and 12';
    }

    if (rent.monthlyRent !== undefined && rent.monthlyRent < 0) {
      errors[`rent_${idx}_monthlyRent`] = 'Monthly rent cannot be negative';
    }
  });

  if (totalMonths > 12) {
    errors.rentMonthsTotal = `Total rental months across all states cannot exceed 12 months in a calendar year (currently ${totalMonths} months)!`;
  }

  // 2. Validate Charitable Donations
  const charities = data.charitableList || [];
  charities.forEach((ch, idx) => {
    const inst = (ch.institutionName || '').trim();
    if (!inst) {
      errors[`charity_${idx}_institutionName`] = 'Charity / Institution name is required';
    } else if (containsXssOrHtml(inst)) {
      errors[`charity_${idx}_institutionName`] = 'HTML tags or script injections are strictly forbidden!';
    } else if (inst.length < 2) {
      errors[`charity_${idx}_institutionName`] = 'Institution name must be at least 2 characters';
    }

    if (ch.amountDonated !== undefined && ch.amountDonated < 0) {
      errors[`charity_${idx}_amountDonated`] = 'Donation amount cannot be negative';
    }
  });

  // 3. Other Deductions Description XSS Check
  if (data.otherDeductionsDescription && containsXssOrHtml(data.otherDeductionsDescription)) {
    errors.otherDeductionsDescription = 'HTML tags or script injections are strictly forbidden!';
  }

  return errors;
};

/**
 * Validates Module 9: Direct Deposit & Referrals
 */
export const validateModule9 = (
  data?: OrganizerData['m9_directDeposit'],
  _selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) {
    return { bankName: 'Direct deposit information is required' };
  }

  // 1. Bank Name
  const bName = (data.bankName || '').trim();
  if (!bName) {
    errors.bankName = 'Bank Name is required for refund direct deposit';
  } else if (containsXssOrHtml(bName)) {
    errors.bankName = 'HTML tags or script injections are strictly forbidden!';
  } else if (bName.length < 2) {
    errors.bankName = 'Bank Name must be at least 2 characters';
  }

  // 2. 9-Digit Routing Number
  const routing = (data.routingNumber || '').trim();
  if (!routing) {
    errors.routingNumber = '9-Digit Routing Number is required';
  } else {
    const rawRouting = routing.replace(/\D/g, '');
    if (rawRouting.length !== 9) {
      errors.routingNumber = 'Routing Number must be exactly 9 digits (e.g. 111000614)';
    }
  }

  // 3. Account Number
  const acct = (data.accountNumber || '').trim();
  if (!acct) {
    errors.accountNumber = 'Account Number is required';
  } else if (containsXssOrHtml(acct)) {
    errors.accountNumber = 'HTML tags or script injections are strictly forbidden!';
  } else {
    const rawAcct = acct.replace(/\D/g, '');
    if (rawAcct.length < 4 || rawAcct.length > 17) {
      errors.accountNumber = 'Account number must be between 4 and 17 digits';
    }
  }

  // 4. Account Owner Name
  const owner = (data.accountOwnerName || '').trim();
  if (!owner) {
    errors.accountOwnerName = 'Account Owner Name as appears on bank statement is required';
  } else if (containsXssOrHtml(owner)) {
    errors.accountOwnerName = 'HTML tags or script injections are strictly forbidden!';
  } else if (owner.length < 2) {
    errors.accountOwnerName = 'Account Owner Name must be at least 2 characters';
  }

  // 5. Notes & Contact Preference Length & XSS Checks
  const notes = data.notesToPreparer || '';
  if (notes) {
    if (containsXssOrHtml(notes)) {
      errors.notesToPreparer = 'HTML tags or script injections are strictly forbidden!';
    } else if (notes.length > 5000) {
      errors.notesToPreparer = `Character limit exceeded! Maximum 5,000 characters allowed (currently ${notes.length} characters).`;
    }
  }

  const contact = data.preferredContactTime || '';
  if (contact) {
    if (containsXssOrHtml(contact)) {
      errors.preferredContactTime = 'HTML tags or script injections are strictly forbidden!';
    } else if (contact.length > 500) {
      errors.preferredContactTime = `Character limit exceeded! Maximum 500 characters allowed (currently ${contact.length} characters).`;
    }
  }

  // 6. Referrals Validation (if any provided)
  const refs = data.referrals || [];
  refs.forEach((ref, idx) => {
    const rName = (ref.name || '').trim();
    if (rName) {
      if (containsXssOrHtml(rName)) {
        errors[`ref_${idx}_name`] = 'HTML tags or script injections are strictly forbidden!';
      } else if (rName.length < 2) {
        errors[`ref_${idx}_name`] = 'Referral name must be at least 2 characters';
      }
    }
    const rEmail = (ref.email || '').trim();
    if (rEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rEmail)) {
      errors[`ref_${idx}_email`] = 'Please provide a valid referral email address';
    }
    const rPhone = (ref.phone || '').trim();
    if (rPhone && rPhone.replace(/\D/g, '').length < 10) {
      errors[`ref_${idx}_phone`] = 'Please provide a valid 10-digit phone number';
    }
  });

  return errors;
};

/**
 * Checks if a specific organizer module has been completed and submitted with valid data
 */
export const isModuleCompleted = (modId: string, organizerData?: OrganizerData | null): boolean => {
  if (!organizerData) return false;

  // 1. If explicit submittedModules array exists, strictly check inclusion
  if (organizerData.submittedModules && Array.isArray(organizerData.submittedModules)) {
    return organizerData.submittedModules.includes(modId);
  }

  // 2. Strict fallback: only modules with actual user-entered data
  switch (modId) {
    case 'm1': {
      const m1 = organizerData.m1_demographics;
      return Boolean(m1 && (m1.firstName || m1.fullName) && m1.city);
    }
    case 'm2': {
      const m2 = organizerData.m2_dependents;
      return Boolean(
        m2 &&
        ((m2.spouseList && m2.spouseList.length > 0) || 
          (m2.dependentsList && m2.dependentsList.length > 0) || 
          (m2.daycareList && m2.daycareList.length > 0) ||
          Boolean(m2.spouseFirstName) ||
          Boolean(m2.spouseName))
      );
    }
    case 'm3': {
      const m3 = organizerData.m3_presence;
      return Boolean(m3 && m3.days2025 !== undefined && m3.days2025 > 0);
    }
    case 'm4': {
      const m4 = organizerData.m4_wages;
      return Boolean(m4 && m4.employerName && (m4.estimatedWages ?? 0) > 0);
    }
    case 'm5': {
      const m5 = organizerData.m5_interest;
      return Boolean(m5 && (Boolean(m5.bankName) || (m5.interestAmount ?? 0) > 0 || (m5.dividendAmount ?? 0) > 0 || (m5.form1099OidAmount ?? 0) > 0));
    }
    case 'm6': {
      const m6 = organizerData.m6_stocks;
      return Boolean(
        m6 &&
        (m6.tradedStocks || 
          Boolean(m6.brokerName) || 
          (m6.stocksList && m6.stocksList.length > 0) || 
          (m6.totalCapitalGain ?? 0) !== 0 || 
          (m6.capitalGainTaxpayer ?? 0) !== 0 ||
          (m6.capitalLossTaxpayer ?? 0) !== 0)
      );
    }
    case 'm7': {
      const m7 = organizerData.m7_foreign;
      return Boolean(
        m7 &&
        (m7.hasFbar || 
          m7.hasFbarOver10k === 'YES' || 
          m7.spouseFbarOver10k === 'YES' ||
          (m7.foreignSalaryInr ?? 0) > 0 ||
          (m7.foreignInterestInr ?? 0) > 0 ||
          (m7.foreignDividendInr ?? 0) > 0 ||
          (m7.foreignRentalInr ?? 0) > 0 ||
          (m7.foreignTaxesPaidInr ?? 0) > 0 ||
          (m7.foreignAccountsList && m7.foreignAccountsList.length > 0))
      );
    }
    case 'm8': {
      const m8 = organizerData.m8_deductions;
      return Boolean(
        m8 &&
        ((m8.rentDeductionsList && m8.rentDeductionsList.length > 0 && m8.rentDeductionsList.some(r => (r.totalRentPaid ?? 0) > 0)) ||
          (m8.charitableList && m8.charitableList.length > 0) ||
          (m8.charitableDonations ?? 0) > 0 ||
          (m8.mortgageInterest1098 ?? 0) > 0 ||
          (m8.propertyTaxesUs ?? 0) > 0 ||
          (m8.medicalExpenses ?? 0) > 0 ||
          (m8.solarCleanEnergyExpenses ?? 0) > 0 ||
          (m8.electricVehicleExpenses ?? 0) > 0 ||
          (m8.studentLoanInterest ?? 0) > 0)
      );
    }
    case 'm9': {
      const m9 = organizerData.m9_directDeposit;
      return Boolean(m9 && m9.bankName && m9.routingNumber && m9.accountNumber && m9.accountOwnerName);
    }
    default:
      return false;
  }
};
