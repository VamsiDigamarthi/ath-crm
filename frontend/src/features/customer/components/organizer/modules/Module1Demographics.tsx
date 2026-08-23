import React from 'react';
import { Lock, User, Globe, Home, Briefcase, Phone, Mail, CreditCard } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';

interface Module1Props {
  data: OrganizerData['m1_demographics'];
  updateField: <K extends keyof OrganizerData['m1_demographics']>(field: K, value: OrganizerData['m1_demographics'][K]) => void;
  selectedTaxYear: number;
}

export const Module1Demographics: React.FC<Module1Props> = ({
  data,
  updateField,
  selectedTaxYear,
}) => {
  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Please fill out your legal name as per your Social Security Card and current residency details.</span>
      </div>

      {/* Basic & Mandatory Demographics Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>Primary Taxpayer Demographics</span>
        </h4>

        {/* Row 1: First Name, Middle Name, Last Name in 3 balanced columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppInput
            label="First Name (as per SSN) *"
            placeholder="e.g. Naveen"
            value={data.firstName || data.fullName?.split(' ')[0] || ''}
            onChange={(e) => {
              const first = e.target.value;
              const middle = data.middleName || '';
              const last = data.lastName || '';
              updateField('firstName', first);
              updateField('fullName', [first, middle, last].filter(Boolean).join(' '));
            }}
          />

          <AppInput
            label="Middle Name (as per SSN)"
            placeholder="e.g. Kumar (Optional)"
            value={data.middleName || ''}
            onChange={(e) => {
              const middle = e.target.value;
              const first = data.firstName || '';
              const last = data.lastName || '';
              updateField('middleName', middle);
              updateField('fullName', [first, middle, last].filter(Boolean).join(' '));
            }}
          />

          <AppInput
            label="Last Name (as per SSN) *"
            placeholder="e.g. Krishnan"
            value={data.lastName || data.fullName?.split(' ').slice(1).join(' ') || ''}
            onChange={(e) => {
              const last = e.target.value;
              const first = data.firstName || '';
              const middle = data.middleName || '';
              updateField('lastName', last);
              updateField('fullName', [first, middle, last].filter(Boolean).join(' '));
            }}
          />
        </div>

        {/* Row 2: DOB (DatePicker), Editable SSN/ITIN, Relationship in 3 balanced columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppDatePicker
            label="Date of Birth (MM/DD/YYYY) *"
            placeholder="MM/DD/YYYY"
            format="MM/dd/yyyy"
            accentColor="#16A34A"
            value={parseUsDate(data.dob)}
            onChange={(d) => updateField('dob', formatUsDate(d))}
          />

          <AppInput
            label="SSN / ITIN (Editable) *"
            placeholder="982-14-0124"
            leftIcon={<CreditCard className="w-4 h-4" />}
            value={data.ssnMasked || ''}
            onChange={(e) => updateField('ssnMasked', e.target.value)}
          />

          <AppSelect
            label="Relationship With Primary Taxpayer *"
            options={[
              { label: 'Self (Primary Taxpayer)', value: 'SELF' },
              { label: 'Spouse (Joint Filer)', value: 'SPOUSE' },
              { label: 'Son / Daughter', value: 'CHILD' },
              { label: 'Parents (Dependent)', value: 'PARENT' },
            ]}
            value={data.relationshipToPrimary || 'SELF'}
            onChange={(val) => updateField('relationshipToPrimary', val || 'SELF')}
          />
        </div>

        {/* Row 3: Occupation, Mobile, Work Phone, Email in 4 balanced columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AppInput
            label="Occupation *"
            placeholder="e.g. Smart Grid Engineer"
            leftIcon={<Briefcase className="w-4 h-4" />}
            value={data.occupation || ''}
            onChange={(e) => updateField('occupation', e.target.value)}
          />

          <AppInput
            label="Mobile Phone Number *"
            placeholder="+1 (713) 555-0138"
            leftIcon={<Phone className="w-4 h-4" />}
            value={data.phone || '+1 (713) 555-0138'}
            onChange={(e) => updateField('phone', e.target.value)}
          />

          <AppInput
            label="Work Phone Number"
            placeholder="+1 (713) 555-9821"
            leftIcon={<Phone className="w-4 h-4" />}
            value={data.workPhone || ''}
            onChange={(e) => updateField('workPhone', e.target.value)}
          />

          <AppInput
            label="Email Address *"
            placeholder="taxpayer@domain.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={data.email || 'naveen.k@energygrids.com'}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
      </div>

      {/* Visa & U.S. Entry Details Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>VISA Status &amp; U.S. Entry Details</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppSelect
            label={`VISA Type as of 12/31/${selectedTaxYear} *`}
            options={[
              { label: 'H-1B (Specialty Worker)', value: 'H-1B' },
              { label: 'F-1 OPT / CPT (Student)', value: 'F-1 OPT' },
              { label: 'L-1A / L-1B (Intracompany)', value: 'L-1' },
              { label: 'H-4 / H-4 EAD (Dependent)', value: 'H-4 EAD' },
              { label: 'O-1 (Extraordinary Ability)', value: 'O-1' },
              { label: 'Green Card (Permanent Resident)', value: 'GREEN_CARD' },
              { label: 'U.S. Citizen', value: 'US_CITIZEN' },
              { label: 'B-1 / B-2 / Other Visa', value: 'OTHER' },
            ]}
            value={data.visaType || 'H-1B'}
            onChange={(val) => updateField('visaType', val || 'H-1B')}
            placeholder="Select Visa Type"
          />

          <AppSelect
            label={`Any Changes in VISA status during ${selectedTaxYear}?`}
            options={[
              { label: 'No - Same Visa All Year', value: 'NO' },
              { label: 'Yes - Visa Changed Status', value: 'YES' },
            ]}
            value={data.visaStatusChanged2025 || 'NO'}
            onChange={(val) => updateField('visaStatusChanged2025', (val || 'NO') as 'YES' | 'NO')}
          />

          <AppDatePicker
            label="Date of VISA Status Change"
            placeholder="MM/DD/YYYY"
            format="MM/dd/yyyy"
            accentColor="#16A34A"
            disabled={data.visaStatusChanged2025 !== 'YES'}
            value={parseUsDate(data.visaChangeDate)}
            onChange={(d) => updateField('visaChangeDate', formatUsDate(d))}
          />

          <AppDatePicker
            label="First Port of Entry in the U.S. *"
            placeholder="MM/DD/YYYY (e.g. 08/15/2018)"
            format="MM/dd/yyyy"
            accentColor="#16A34A"
            value={parseUsDate(data.firstPortOfEntryDate || '08/15/2018')}
            onChange={(d) => updateField('firstPortOfEntryDate', formatUsDate(d))}
          />

          <AppSelect
            label={`Will you stay in U.S. for > 6 months in ${selectedTaxYear + 1}? *`}
            options={[
              { label: 'Yes (Staying > 6 months)', value: 'YES' },
              { label: 'No (Departing US / Short stay)', value: 'NO' },
            ]}
            value={data.stayMoreThan6Months2026 || 'YES'}
            onChange={(val) => updateField('stayMoreThan6Months2026', (val || 'YES') as 'YES' | 'NO')}
          />

          <AppInput
            label={`Total Months Stayed in U.S. during ${selectedTaxYear} *`}
            type="number"
            placeholder="12"
            value={data.monthsStayedInUs2025?.toString() || '12'}
            onChange={(e) => updateField('monthsStayedInUs2025', parseInt(e.target.value, 10) || 12)}
          />
        </div>
      </div>

      {/* Marital Status & Current Address Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Home className="w-4 h-4 text-purple-600" />
          <span>Marital Status &amp; Current Residential Address</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppSelect
            label="Filing / Marital Status *"
            options={[
              { label: 'Single ($15,000 Standard Deduction)', value: 'Single' },
              { label: 'Married Filing Jointly ($30,000 Deduction)', value: 'Married Filing Jointly' },
              { label: 'Married Filing Separately ($15,000 Deduction)', value: 'Married Filing Separately' },
              { label: 'Head of Household ($22,500 Deduction)', value: 'Head of Household' },
              { label: 'Widowed / Qualifying Surviving Spouse', value: 'Widowed' },
            ]}
            value={data.maritalStatus || 'Single'}
            onChange={(val) => updateField('maritalStatus', val || 'Single')}
            placeholder="Select Marital Status"
          />

          <AppDatePicker
            label="Date of Marriage (MM/DD/YYYY)"
            placeholder={data.maritalStatus?.includes('Married') ? 'MM/DD/YYYY' : 'N/A - Single'}
            format="MM/dd/yyyy"
            accentColor="#16A34A"
            disabled={!data.maritalStatus?.includes('Married')}
            value={parseUsDate(data.dateOfMarriage)}
            onChange={(d) => updateField('dateOfMarriage', formatUsDate(d))}
          />
        </div>

        <div>
          <AppInput
            label="Current Residential Street Address *"
            placeholder="e.g. 1000 Louisiana St, Suite 4200"
            leftIcon={<Home className="w-4 h-4" />}
            value={data.residentialAddress || '1000 Louisiana St'}
            onChange={(e) => updateField('residentialAddress', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppInput
            label="City *"
            placeholder="e.g. Houston"
            value={data.city || 'Houston'}
            onChange={(e) => updateField('city', e.target.value)}
          />

          <AppInput
            label="State (2-Letter Code) *"
            placeholder="e.g. TX"
            value={data.state || 'TX'}
            onChange={(e) => updateField('state', e.target.value.toUpperCase())}
          />

          <AppInput
            label="ZIP Code *"
            placeholder="e.g. 77002"
            value={data.zipCode || '77002'}
            onChange={(e) => updateField('zipCode', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
