import { type OrganizerData } from '../../../services/customer-api';
import { parseUsDate } from './organizer-date-helpers';
import { isValidUsState } from '@/shared/constants/us-states';

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
  } else if (!isValidUsState(state)) {
    errors.state = 'Please select a valid US state';
  }

  // 13. ZIP Code
  const zip = (data.zipCode || '').trim();
  if (!zip) {
    errors.zipCode = 'ZIP Code is required';
  } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
    errors.zipCode = 'Please enter a valid 5-digit US ZIP code (e.g. 77002)';
  }

  // 14. Filing / Marital Status
  const marital = (data.maritalStatus || '').trim();
  if (!marital) {
    errors.maritalStatus = 'Filing / Marital Status is required';
  }

  // 15. Marriage Date (ONLY required when Married filing status is selected)
  if (marital.includes('Married')) {
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

  // 15b. Spouse Date of Death (required for Widowed / Qualifying Surviving Spouse)
  if (marital === 'Widowed') {
    if (!data.spouseDateOfDeath || !data.spouseDateOfDeath.trim()) {
      errors.spouseDateOfDeath = "Spouse's date of death is required for Qualifying Surviving Spouse";
    } else {
      const deathDate = parseUsDate(data.spouseDateOfDeath);
      if (!deathDate || isNaN(deathDate.getTime())) {
        errors.spouseDateOfDeath = 'Please enter a valid date (MM/DD/YYYY)';
      } else if (deathDate > today) {
        errors.spouseDateOfDeath = 'Date of death cannot be a future date';
      } else if (data.dateOfMarriage) {
        const marriageDate = parseUsDate(data.dateOfMarriage);
        if (marriageDate && deathDate < marriageDate) {
          errors.spouseDateOfDeath = 'Date of death must be after the date of marriage';
        }
      }
    }
  }

  // 15. Visa Status Change Details (if changed)
  if (data.visaStatusChanged2025 === 'YES') {
    if (!data.previousVisaType || !data.previousVisaType.trim()) {
      errors.previousVisaType = 'Previous VISA type is required';
    }

    if (!data.newVisaType || !data.newVisaType.trim()) {
      errors.newVisaType = 'New VISA type is required';
    }

    if (!data.visaChangeDate || !data.visaChangeDate.trim()) {
      errors.visaChangeDate = 'Effective date of VISA status change is required';
    } else {
      const vDate = parseUsDate(data.visaChangeDate);
      if (vDate && vDate > today) {
        errors.visaChangeDate = 'VISA status change effective date cannot be a future date!';
      }
    }

    if (!data.visaStatusChangeReason || !data.visaStatusChangeReason.trim()) {
      errors.visaStatusChangeReason = 'Reason for VISA status change is required';
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

  // 1. Validate Spouse Details (Required if Married filing status, optional if Single)
  const isMarried = maritalStatus?.includes('Married');
  const sp = (data.spouseList && data.spouseList.length > 0)
    ? data.spouseList[0]
    : {
        firstName: data.spouseFirstName || '',
        middleName: data.spouseMiddleName || '',
        lastName: data.spouseLastName || '',
        dob: data.spouseDob || '',
        ssn: data.spouseSsn || '',
        occupation: data.spouseOccupation || '',
        sameAddressAsTaxpayer: data.spouseSameAddressAsTaxpayer !== undefined ? data.spouseSameAddressAsTaxpayer : true,
        residentialAddress: data.spouseResidentialAddress || '',
        city: data.spouseCity || '',
        state: data.spouseState || '',
        zipCode: data.spouseZipCode || '',
      };

  const hasAnySpouseField = !!(sp.firstName || sp.lastName || sp.dob || sp.ssn || sp.occupation);

  if (isMarried || hasAnySpouseField) {
    const first = (sp.firstName || '').trim();
    if (!first) {
      errors.spouse_0_firstName = 'Spouse First Name is required as per SSN';
    } else if (first.length < 2) {
      errors.spouse_0_firstName = 'Spouse First Name must be at least 2 characters';
    }

    const last = (sp.lastName || '').trim();
    if (!last) {
      errors.spouse_0_lastName = 'Spouse Last Name is required as per SSN';
    } else if (last.length < 2) {
      errors.spouse_0_lastName = 'Spouse Last Name must be at least 2 characters';
    }

    const dob = (sp.dob || '').trim();
    if (!dob) {
      errors.spouse_0_dob = 'Spouse Date of Birth is required (MM/DD/YYYY)';
    } else {
      const dobDate = parseUsDate(dob);
      if (!dobDate || isNaN(dobDate.getTime())) {
        errors.spouse_0_dob = 'Please enter a valid date (MM/DD/YYYY)';
      } else if (dobDate > today) {
        errors.spouse_0_dob = 'Spouse Date of Birth cannot be in the future!';
      } else if (dobDate.getFullYear() < 1900) {
        errors.spouse_0_dob = 'Please enter a valid birth year (1900 or later)';
      }
    }

    const ssn = (sp.ssn || '').trim();
    if (!ssn) {
      errors.spouse_0_ssn = 'Spouse SSN / ITIN is required';
    } else if (!ssn.includes('•')) {
      const rawSsn = ssn.replace(/\D/g, '');
      if (rawSsn.length !== 9) {
        errors.spouse_0_ssn = 'Spouse SSN must be 9 digits (e.g. 123-45-6789)';
      }
    }

    const occupation = (sp.occupation || '').trim();
    if (!occupation) {
      errors.spouse_0_occupation = 'Spouse Occupation is required (e.g. Financial Analyst or Homemaker)';
    }

    // Validate separate spouse address if user unchecked "same address as taxpayer"
    if (sp.sameAddressAsTaxpayer === false) {
      const spAddr = (sp.residentialAddress || '').trim();
      if (!spAddr) {
        errors.spouse_0_residentialAddress = 'Spouse street address is required';
      }
      const spCity = (sp.city || '').trim();
      if (!spCity) {
        errors.spouse_0_city = 'Spouse city is required';
      }
      const spState = (sp.state || '').trim();
      if (!spState) {
        errors.spouse_0_state = 'Spouse state is required';
      } else if (!isValidUsState(spState)) {
        errors.spouse_0_state = 'Please select a valid US state for spouse';
      }
      const spZip = (sp.zipCode || '').trim();
      if (!spZip) {
        errors.spouse_0_zipCode = 'Spouse ZIP code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(spZip)) {
        errors.spouse_0_zipCode = 'Please enter a valid 5-digit US ZIP code';
      }
    }
  }

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
  // Optional: left blank means 0 days
  if (data.days2024 === undefined || data.days2024 === null) {
    // no error
  } else if (isNaN(data.days2024) || data.days2024 < 0) {
    errors.days2024 = `Days cannot be negative (min: 0)`;
  } else if (data.days2024 > maxPrior1Days) {
    errors.days2024 = `Days in ${selectedTaxYear - 1} cannot exceed ${maxPrior1Days} days!`;
  }

  // 3. Prior Year 2 Days (e.g. 2023)
  const maxPrior2Days = isLeapYear(selectedTaxYear - 2) ? 366 : 365;
  // Optional: left blank means 0 days
  if (data.days2023 === undefined || data.days2023 === null) {
    // no error
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
      errors[`state_${idx}_state`] = 'Taxpayer State is required';
    } else if (!isValidUsState(st)) {
      errors[`state_${idx}_state`] = 'Please select a valid US state';
    }

    if (row.spouseState && row.spouseState.trim() && !isValidUsState(row.spouseState)) {
      errors[`state_${idx}_spouseState`] = 'Please select a valid US state for spouse';
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

  // 5. Rental Properties Validation
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

    if (prop.rentedDate) {
      const rDate = parseUsDate(prop.rentedDate);
      if (!rDate || isNaN(rDate.getTime())) {
        errors[`rental_${idx}_rentedDate`] = 'Enter valid rented date (MM/DD/YYYY)';
      } else if (rDate > new Date()) {
        errors[`rental_${idx}_rentedDate`] = 'Property rented date cannot be a future date!';
      }
    }
  });

  return errors;
};

/**
 * Validates Module 4: Form W-2 Wages
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

  // 3. 1099-INT Federal Tax Withheld Validation
  if (data.interestFedTaxWithheld !== undefined && data.interestFedTaxWithheld !== null) {
    if (isNaN(data.interestFedTaxWithheld) || data.interestFedTaxWithheld < 0) {
      errors.interestFedTaxWithheld = '1099-INT Federal Tax Withheld cannot be negative';
    }
  }

  // 4. Dividend Amount Validation
  if (data.dividendAmount !== undefined && data.dividendAmount !== null) {
    if (isNaN(data.dividendAmount) || data.dividendAmount < 0) {
      errors.dividendAmount = 'Dividend income cannot be negative';
    }
  }

  // 5. 1099-DIV Federal Tax Withheld Validation
  if (data.dividendFedTaxWithheld !== undefined && data.dividendFedTaxWithheld !== null) {
    if (isNaN(data.dividendFedTaxWithheld) || data.dividendFedTaxWithheld < 0) {
      errors.dividendFedTaxWithheld = '1099-DIV Federal Tax Withheld cannot be negative';
    }
  }

  // 6. 1099-OID Amount Validation
  if (data.form1099OidAmount !== undefined && data.form1099OidAmount !== null) {
    if (isNaN(data.form1099OidAmount) || data.form1099OidAmount < 0) {
      errors.form1099OidAmount = '1099-OID amount cannot be negative';
    }
  }

  // 7. 1099-OID Federal Tax Withheld Validation
  if (data.form1099OidFedTaxWithheld !== undefined && data.form1099OidFedTaxWithheld !== null) {
    if (isNaN(data.form1099OidFedTaxWithheld) || data.form1099OidFedTaxWithheld < 0) {
      errors.form1099OidFedTaxWithheld = '1099-OID Federal Tax Withheld cannot be negative';
    }
  }

  return errors;
};

/**
 * Validates Module 10: Form 1099-R IRA & Retirement Distributions
 */
export const validateModule10Retirement = (
  data?: OrganizerData['m10_retirement'],
  _selectedTaxYear: number = 2025
): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  // 1. Payer / Custodian Name Validation
  const payer = (data.payerName || '').trim();
  if (payer) {
    if (containsXssOrHtml(payer)) {
      errors.payerName = 'HTML tags or script injections are strictly forbidden!';
    } else if (payer.length < 2) {
      errors.payerName = 'Payer / Custodian name must be at least 2 characters';
    }
  }

  // 2. Gross Distribution Validation
  if (data.grossDistribution !== undefined && data.grossDistribution !== null) {
    if (isNaN(data.grossDistribution) || data.grossDistribution < 0) {
      errors.grossDistribution = 'Gross distribution amount cannot be negative';
    } else if (data.grossDistribution > 0 && !payer) {
      errors.payerName = 'Payer / Custodian name is required when distribution amount is reported';
    }
  }

  // 3. Federal Tax Withheld Validation
  if (data.fedTaxWithheld !== undefined && data.fedTaxWithheld !== null) {
    if (isNaN(data.fedTaxWithheld) || data.fedTaxWithheld < 0) {
      errors.fedTaxWithheld = 'IRA Federal Tax Withheld cannot be negative';
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
    const bName = (acc.institutionName || acc.bankName || '').trim();
    if (!bName) {
      errors[`foreignAcc_${idx}_bankName`] = 'Bank / Institution Name is required (e.g. HDFC, SBI, ICICI)';
    } else if (containsXssOrHtml(bName)) {
      errors[`foreignAcc_${idx}_bankName`] = 'HTML tags or script injections are strictly forbidden!';
    } else if (bName.length < 2) {
      errors[`foreignAcc_${idx}_bankName`] = 'Bank name must be at least 2 characters';
    }

    const peak = acc.maxValue !== undefined ? acc.maxValue : acc.maxBalanceInr;
    if (peak !== undefined && (isNaN(peak) || peak < 0)) {
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
  if (!data) return errors;

  // Bank details are optional: only guard against script/HTML injection
  const bankFields = ['bankName', 'routingNumber', 'accountNumber', 'accountOwnerName'] as const;
  bankFields.forEach((field) => {
    const value = (data[field] || '').trim();
    if (value && containsXssOrHtml(value)) {
      errors[field] = 'HTML tags or script injections are strictly forbidden!';
    }
  });

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
      return Boolean(
        m3 &&
        ((m3.days2025 !== undefined && m3.days2025 > 0) ||
          (m3.rentalProperties && m3.rentalProperties.length > 0) ||
          (m3.statesResidedHistory && m3.statesResidedHistory.length > 0))
      );
    }
    case 'm4': {
      const m4 = organizerData.m4_wages;
      return Boolean(m4 && m4.employerName && (m4.estimatedWages ?? 0) > 0);
    }
    case 'm5': {
      const m5 = organizerData.m5_interest;
      return Boolean(m5 && (Boolean(m5.bankName) || (m5.interestAmount ?? 0) > 0 || (m5.dividendAmount ?? 0) > 0 || (m5.form1099OidAmount ?? 0) > 0));
    }
    case 'm10': {
      const m10 = organizerData.m10_retirement;
      return Boolean(m10 && (Boolean(m10.payerName) || (m10.grossDistribution ?? 0) > 0 || (m10.fedTaxWithheld ?? 0) > 0));
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
    case 'm_income': {
      return (
        isModuleCompleted('m4', organizerData) ||
        isModuleCompleted('m5', organizerData) ||
        isModuleCompleted('m10', organizerData) ||
        isModuleCompleted('m6', organizerData)
      );
    }
    case 'm_expenses': {
      return isModuleCompleted('m8', organizerData);
    }
    case 'm_income_expenses': {
      return (
        isModuleCompleted('m4', organizerData) ||
        isModuleCompleted('m5', organizerData) ||
        isModuleCompleted('m10', organizerData) ||
        isModuleCompleted('m6', organizerData) ||
        isModuleCompleted('m8', organizerData)
      );
    }
    case 'b1_companyInfo': {
      const b1 = organizerData.b1_companyInfo;
      return Boolean(b1 && b1.businessName && b1.ein);
    }
    case 'b2_businessIncome': {
      const b2 = organizerData.b2_businessIncome;
      return Boolean(
        b2 &&
        ((b2.clientIncome1099 && b2.clientIncome1099.length > 0) ||
          (b2.grossSalesNot1099 ?? 0) > 0 ||
          (b2.interestIncome ?? 0) > 0 ||
          (b2.dividendIncome ?? 0) > 0 ||
          (b2.otherIncomeAmount ?? 0) > 0)
      );
    }
    case 'b3_businessExpenses': {
      const b3 = organizerData.b3_businessExpenses;
      return Boolean(
        b3 &&
        ((b3.officerCompensation ?? 0) > 0 ||
          (b3.employeeWages ?? 0) > 0 ||
          (b3.contractorPayments ?? 0) > 0 ||
          (b3.rentProperty ?? 0) > 0 ||
          (b3.advertisingMarketing ?? 0) > 0 ||
          (b3.legalProfessionalFees ?? 0) > 0 ||
          (b3.hasVehicleExpenses && (b3.vehicles?.length ?? 0) > 0) ||
          (b3.hasEquipmentPurchases && (b3.equipmentAssets?.length ?? 0) > 0) ||
          (b3.hasHomeOffice && (b3.homeOffice?.officeSquareFootage ?? 0) > 0))
      );
    }
    case 'm_vault': {
      return false;
    }
    default:
      return false;
  }
};

/**
 * Validates Business Module 1: Company Information & Partners
 */
export const validateBusinessCompanyInfo = (data?: OrganizerData['b1_companyInfo']): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) {
    return { businessName: 'Company Information is required' };
  }

  const name = (data.businessName || '').trim();
  if (!name) {
    errors.businessName = 'Legal Business Name is required';
  } else if (name.length < 2) {
    errors.businessName = 'Business Name must be at least 2 characters';
  }

  const ein = (data.ein || '').trim();
  if (!ein) {
    errors.ein = 'Employer Identification Number (EIN) is required';
  } else if (!/^\d{2}-?\d{7}$/.test(ein)) {
    errors.ein = 'Please enter a valid 9-digit EIN (e.g. 12-3456789)';
  }

  if (!data.entityType) {
    errors.entityType = 'Business Entity Type is required';
  }

  if (!data.address?.trim()) {
    errors.address = 'Street Address is required';
  }

  if (!data.city?.trim()) {
    errors.city = 'City is required';
  }

  if (!data.state?.trim()) {
    errors.state = 'State is required';
  } else if (!isValidUsState(data.state)) {
    errors.state = 'Please select a valid US state';
  }

  if (!data.zipCode?.trim()) {
    errors.zipCode = 'ZIP Code is required';
  }

  if (!data.contactName?.trim()) {
    errors.contactName = 'Authorized Contact Name is required';
  }

  if (!data.contactEmail?.trim()) {
    errors.contactEmail = 'Contact Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail.trim())) {
    errors.contactEmail = 'Please enter a valid email address';
  }

  if (!data.contactPhone?.trim()) {
    errors.contactPhone = 'Contact Phone is required';
  }

  // Validate partners if present
  if (data.partners && data.partners.length > 0) {
    let totalOwnership = 0;
    data.partners.forEach((partner, idx) => {
      if (!partner.name?.trim()) {
        errors[`partner_${idx}_name`] = `Partner #${idx + 1} Name is required`;
      }
      const pct = Number(partner.ownershipPercentage) || 0;
      if (pct < 0 || pct > 100) {
        errors[`partner_${idx}_ownership`] = `Partner #${idx + 1} ownership must be between 0% and 100%`;
      }
      totalOwnership += pct;
    });
    if (totalOwnership > 100) {
      errors.totalOwnership = `Total partner ownership cannot exceed 100% (currently ${totalOwnership}%)`;
    }
  }

  return errors;
};

/**
 * Validates Business Module 2: Income
 */
export const validateBusinessIncome = (data?: OrganizerData['b2_businessIncome']): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  if (data.clientIncome1099 && data.clientIncome1099.length > 0) {
    data.clientIncome1099.forEach((item, idx) => {
      if (!item.clientName?.trim()) {
        errors[`client_${idx}_name`] = `Client #${idx + 1} Name is required`;
      }
      if (item.grossAmount !== undefined && item.grossAmount < 0) {
        errors[`client_${idx}_amount`] = 'Amount cannot be negative';
      }
    });
  }

  return errors;
};

/**
 * Validates Business Module 3: Expenses
 */
export const validateBusinessExpenses = (data?: OrganizerData['b3_businessExpenses']): ValidationErrorMap => {
  const errors: ValidationErrorMap = {};
  if (!data) return errors;

  if (data.hasVehicleExpenses && data.vehicles && data.vehicles.length > 0) {
    data.vehicles.forEach((veh, idx) => {
      if (!veh.vehicleDescription?.trim()) {
        errors[`vehicle_${idx}_desc`] = `Vehicle #${idx + 1} description is required`;
      }
    });
  }

  if (data.hasEquipmentPurchases && data.equipmentAssets && data.equipmentAssets.length > 0) {
    data.equipmentAssets.forEach((asset, idx) => {
      if (!asset.description?.trim()) {
        errors[`asset_${idx}_desc`] = `Asset #${idx + 1} description is required`;
      }
    });
  }

  return errors;
};
