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
 * Checks if a specific organizer module has been completed and submitted with valid data
 */
export const isModuleCompleted = (modId: string, organizerData?: OrganizerData | null): boolean => {
  if (!organizerData) return false;
  switch (modId) {
    case 'm1': {
      const m1 = organizerData.m1_demographics;
      return Boolean(m1 && (m1.firstName || m1.fullName) && m1.city);
    }
    case 'm2': {
      const m2 = organizerData.m2_dependents;
      return m2 !== undefined && (
        m2.hasSpouse || 
        m2.hasDependents || 
        (m2.spouseList && m2.spouseList.length > 0) || 
        (m2.dependentsList && m2.dependentsList.length > 0) || 
        Boolean(m2.spouseName)
      );
    }
    case 'm3': {
      const m3 = organizerData.m3_presence;
      return Boolean(m3 && m3.days2025 > 0);
    }
    case 'm4': {
      const m4 = organizerData.m4_wages;
      return Boolean(m4 && (m4.hasW2 || m4.employerName || (m4.w2List && m4.w2List.length > 0) || m4.hasRentalProperty));
    }
    case 'm5': {
      const m5 = organizerData.m5_interest;
      return Boolean(m5 && (m5.hasInterestDividends || m5.bankName || (m5.interestAmount ?? 0) > 0 || (m5.dividendAmount ?? 0) > 0));
    }
    case 'm6': {
      const m6 = organizerData.m6_stocks;
      return Boolean(m6 && (m6.tradedStocks || m6.brokerName || (m6.stocksList && m6.stocksList.length > 0) || (m6.totalCapitalGain ?? 0) > 0));
    }
    case 'm7': {
      const m7 = organizerData.m7_foreign;
      return Boolean(m7 && (m7.hasFbar || m7.indianBankName || (m7.foreignSalaryInr ?? 0) > 0 || (m7.foreignAccountsList && m7.foreignAccountsList.length > 0)));
    }
    case 'm8': {
      const m8 = organizerData.m8_deductions;
      return Boolean(m8 && (
        (m8.hsaContribution ?? 0) > 0 || 
        (m8.mortgageInterest1098 ?? 0) > 0 || 
        (m8.studentLoanInterest ?? 0) > 0 || 
        Boolean(m8.stateRentDeduction) || 
        (m8.charitableList && m8.charitableList.length > 0) || 
        (m8.rentDeductionsList && m8.rentDeductionsList.length > 0)
      ));
    }
    case 'm9': {
      const m9 = organizerData.m9_directDeposit;
      return Boolean(m9 && m9.routingNumber && m9.accountNumber);
    }
    default:
      return false;
  }
};
