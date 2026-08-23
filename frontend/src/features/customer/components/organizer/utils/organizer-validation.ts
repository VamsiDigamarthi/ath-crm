import { type OrganizerData } from '../../../services/customer-api';
import { parseUsDate } from './organizer-date-helpers';

export type ValidationErrorMap = Record<string, string>;

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
    default:
      return false;
  }
};
