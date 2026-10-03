import React from 'react';
import { 
  Home, 
  Briefcase, 
  Phone, 
  Mail, 
  CreditCard, 
  AlertCircle
} from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';
import { US_STATE_OPTIONS } from '@/shared/constants/us-states';
import { formatSsn } from '../utils/ssn-format';

interface DemographicsTaxpayerSectionProps {
  data: Partial<OrganizerData['m1_demographics']>;
  m2Data?: Partial<OrganizerData['m2_dependents']>;
  updateField: <K extends keyof OrganizerData['m1_demographics']>(field: K, value: OrganizerData['m1_demographics'][K]) => void;
  updateM2Field?: <K extends keyof OrganizerData['m2_dependents']>(field: K, value: OrganizerData['m2_dependents'][K]) => void;
  selectedTaxYear: number;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const DemographicsTaxpayerSection: React.FC<DemographicsTaxpayerSectionProps> = ({
  data,
  m2Data,
  updateField,
  updateM2Field,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const d = data || {};
  const m2 = m2Data || {};

  const handleFieldChange = <K extends keyof OrganizerData['m1_demographics']>(
    field: K,
    value: OrganizerData['m1_demographics'][K]
  ) => {
    updateField(field, value);
    if (clearError) {
      clearError(field as string);
    }
  };

  // Derive primary taxpayer names
  const displayFirstName = d.firstName ?? (d.fullName ? d.fullName.split(' ')[0] : '');
  const displayLastName = d.lastName ?? (d.fullName ? d.fullName.split(' ').slice(1).join(' ') : '');

  // Resolve spouse details smoothly
  const spouse = (m2.spouseList && m2.spouseList.length > 0)
    ? m2.spouseList[0]
    : {
        firstName: m2.spouseFirstName || m2.spouseName?.split(' ')[0] || '',
        middleName: m2.spouseMiddleName || '',
        lastName: m2.spouseLastName || m2.spouseName?.split(' ').slice(1).join(' ') || (d.maritalStatus?.includes('Married') ? (displayLastName || '') : ''),
        dob: m2.spouseDob || '',
        ssn: m2.spouseSsn || '',
        occupation: m2.spouseOccupation || '',
        visaType: m2.spouseVisaType || 'H-4 EAD',
        workPhone: m2.spouseWorkPhone || '',
        email: m2.spouseEmail || '',
        relationship: m2.spouseRelationship || 'Spouse',
        sameAddressAsTaxpayer: m2.spouseSameAddressAsTaxpayer !== undefined ? m2.spouseSameAddressAsTaxpayer : true,
        residentialAddress: m2.spouseResidentialAddress || '',
        city: m2.spouseCity || '',
        state: m2.spouseState || '',
        zipCode: m2.spouseZipCode || '',
      };

  const handleSpouseChange = (field: string, value: any, errorKey?: string) => {
    if (!updateM2Field) return;
    const updatedSpouse = {
      ...spouse,
      [field]: value,
    };

    if (field === 'firstName') {
      updateM2Field('spouseFirstName', value);
      updateM2Field('spouseName', `${value} ${updatedSpouse.lastName || ''}`.trim());
    } else if (field === 'middleName') {
      updateM2Field('spouseMiddleName', value);
    } else if (field === 'lastName') {
      updateM2Field('spouseLastName', value);
      updateM2Field('spouseName', `${updatedSpouse.firstName || ''} ${value}`.trim());
    } else if (field === 'dob') {
      updateM2Field('spouseDob', value);
    } else if (field === 'ssn') {
      updateM2Field('spouseSsn', value);
    } else if (field === 'occupation') {
      updateM2Field('spouseOccupation', value);
    } else if (field === 'visaType') {
      updateM2Field('spouseVisaType', value);
    } else if (field === 'workPhone') {
      updateM2Field('spouseWorkPhone', value);
    } else if (field === 'email') {
      updateM2Field('spouseEmail', value);
    } else if (field === 'relationship') {
      updateM2Field('spouseRelationship', value);
    } else if (field === 'sameAddressAsTaxpayer') {
      updateM2Field('spouseSameAddressAsTaxpayer', value);
    } else if (field === 'residentialAddress') {
      updateM2Field('spouseResidentialAddress', value);
    } else if (field === 'city') {
      updateM2Field('spouseCity', value);
    } else if (field === 'state') {
      updateM2Field('spouseState', value);
    } else if (field === 'zipCode') {
      updateM2Field('spouseZipCode', value);
    }

    updateM2Field('spouseList', [updatedSpouse]);
    updateM2Field('hasSpouse', true);

    if (errorKey && clearError) {
      clearError(errorKey);
    }
    if (clearError) {
      clearError('spouse_general');
    }
  };

  const isMarried = Boolean(d.maritalStatus?.includes('Married'));

  return (
    <div className="space-y-4">
      {/* Row 1: First Name, Middle Name, Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AppInput
          label="First Name (as per SSN) *"
          placeholder="e.g. Naveen"
          error={errors.firstName}
          value={displayFirstName}
          onChange={(e) => {
            const first = e.target.value;
            const middle = d.middleName || '';
            const last = displayLastName;
            handleFieldChange('firstName', first);
            handleFieldChange('fullName', [first, middle, last].filter(Boolean).join(' '));
          }}
        />

        <AppInput
          label="Middle Name (as per SSN)"
          placeholder="e.g. Kumar (Optional)"
          error={errors.middleName}
          value={d.middleName || ''}
          onChange={(e) => {
            const middle = e.target.value;
            const first = displayFirstName;
            const last = displayLastName;
            handleFieldChange('middleName', middle);
            handleFieldChange('fullName', [first, middle, last].filter(Boolean).join(' '));
          }}
        />

        <AppInput
          label="Last Name (as per SSN) *"
          placeholder="e.g. Krishnan"
          error={errors.lastName}
          value={displayLastName}
          onChange={(e) => {
            const last = e.target.value;
            const first = displayFirstName;
            const middle = d.middleName || '';
            handleFieldChange('lastName', last);
            handleFieldChange('fullName', [first, middle, last].filter(Boolean).join(' '));
          }}
        />
      </div>

      {/* Row 2: DOB (DatePicker), Editable SSN/ITIN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppDatePicker
          label="Date of Birth (MM/DD/YYYY) *"
          placeholder="MM/DD/YYYY"
          format="MM/dd/yyyy"
          accentColor="#16A34A"
          maxDate={new Date()}
          error={errors.dob}
          value={parseUsDate(d.dob)}
          onChange={(dateVal) => handleFieldChange('dob', formatUsDate(dateVal))}
        />

        <AppInput
          label="SSN / ITIN (Editable) *"
          type="password"
          placeholder="982-14-6789"
          leftIcon={<CreditCard className="w-4 h-4" />}
          error={errors.ssnMasked}
          value={formatSsn(d.ssnMasked)}
          onChange={(e) => handleFieldChange('ssnMasked', formatSsn(e.target.value))}
        />
      </div>

      {/* Row 3: Occupation, Mobile, Work Phone, Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppInput
          label="Occupation *"
          placeholder="e.g. Smart Grid Engineer"
          leftIcon={<Briefcase className="w-4 h-4" />}
          error={errors.occupation}
          value={d.occupation || ''}
          onChange={(e) => handleFieldChange('occupation', e.target.value)}
        />

        <AppInput
          label="Mobile Phone Number *"
          placeholder="+1 (713) 555-0138"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone}
          value={d.phone || ''}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
        />

        <AppInput
          label="Work Phone Number"
          placeholder="+1 (713) 555-9821"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.workPhone}
          value={d.workPhone || ''}
          onChange={(e) => handleFieldChange('workPhone', e.target.value)}
        />

        <AppInput
          label="Email Address *"
          placeholder="taxpayer@domain.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email}
          value={d.email || ''}
          onChange={(e) => handleFieldChange('email', e.target.value)}
        />
      </div>

      {/* 2. Visa & U.S. Entry Details Section */}
      <div className="space-y-4">
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
            error={errors.visaType}
            value={d.visaType || 'H-1B'}
            onChange={(val) => handleFieldChange('visaType', val || 'H-1B')}
            placeholder="Select Visa Type"
          />

          <AppSelect
            label={`Any Changes in VISA status during ${selectedTaxYear}?`}
            options={[
              { label: 'No - Same Visa All Year', value: 'NO' },
              { label: 'Yes - Visa Changed Status', value: 'YES' },
            ]}
            error={errors.visaStatusChanged2025}
            value={d.visaStatusChanged2025 || 'NO'}
            onChange={(val) => {
              const newVal = (val || 'NO') as 'YES' | 'NO';
              handleFieldChange('visaStatusChanged2025', newVal);
              if (newVal === 'NO') {
                handleFieldChange('previousVisaType', '');
                handleFieldChange('newVisaType', '');
                handleFieldChange('visaChangeDate', '');
                handleFieldChange('visaStatusChangeReason', '');
                if (clearError) {
                  clearError('previousVisaType');
                  clearError('newVisaType');
                  clearError('visaChangeDate');
                  clearError('visaStatusChangeReason');
                }
              }
            }}
          />

          {/* Visa Status Transition Details Box */}
          {d.visaStatusChanged2025 === 'YES' && (
            <div className="sm:col-span-3 p-4 rounded-md bg-amber-50/60 border border-amber-200 space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-medium text-amber-900 flex items-center gap-1.5">
                <span>VISA Status Transition Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AppSelect
                  label="Previous VISA Type *"
                  options={[
                    { label: 'H-1B (Specialty Worker)', value: 'H-1B' },
                    { label: 'F-1 OPT / CPT (Student)', value: 'F-1 OPT' },
                    { label: 'L-1A / L-1B (Intracompany)', value: 'L-1' },
                    { label: 'H-4 / H-4 EAD (Dependent)', value: 'H-4 EAD' },
                    { label: 'O-1 (Extraordinary Ability)', value: 'O-1' },
                    { label: 'Green Card (Permanent Resident)', value: 'GREEN_CARD' },
                    { label: 'B-1 / B-2 / Other Visa', value: 'OTHER' },
                  ]}
                  error={errors.previousVisaType}
                  value={d.previousVisaType || ''}
                  onChange={(val) => handleFieldChange('previousVisaType', val || '')}
                  placeholder="Select Previous Visa"
                />

                <AppSelect
                  label="New VISA Type *"
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
                  error={errors.newVisaType}
                  value={d.newVisaType || ''}
                  onChange={(val) => handleFieldChange('newVisaType', val || '')}
                  placeholder="Select New Visa"
                />

                <AppDatePicker
                  label="Effective Date *"
                  placeholder="MM/DD/YYYY"
                  format="MM/dd/yyyy"
                  accentColor="#16A34A"
                  maxDate={new Date()}
                  error={errors.visaChangeDate}
                  value={parseUsDate(d.visaChangeDate)}
                  onChange={(dateVal) => handleFieldChange('visaChangeDate', formatUsDate(dateVal))}
                />
              </div>

              <div>
                <AppInput
                  label={`Reason for VISA Status Change during ${selectedTaxYear} *`}
                  placeholder="e.g. F-1 OPT to H-1B Cap Approval, H-1B to Green Card (I-485), Change of Employer / Extension"
                  error={errors.visaStatusChangeReason}
                  value={d.visaStatusChangeReason || ''}
                  onChange={(e) => {
                    handleFieldChange('visaStatusChangeReason', e.target.value);
                    if (clearError) clearError('visaStatusChangeReason');
                  }}
                  required
                />
              </div>
            </div>
          )}

          <AppDatePicker
            label="First Port of Entry in the U.S. *"
            placeholder="MM/DD/YYYY (e.g. 08/15/2018)"
            format="MM/dd/yyyy"
            accentColor="#16A34A"
            maxDate={new Date()}
            error={errors.firstPortOfEntryDate}
            value={parseUsDate(d.firstPortOfEntryDate)}
            onChange={(dateVal) => handleFieldChange('firstPortOfEntryDate', formatUsDate(dateVal))}
          />

          <AppSelect
            label={`Will you stay in U.S. for > 6 months in ${selectedTaxYear + 1}? *`}
            options={[
              { label: 'Yes (Staying > 6 months)', value: 'YES' },
              { label: 'No (Departing US / Short stay)', value: 'NO' },
            ]}
            error={errors.stayMoreThan6Months2026}
            value={d.stayMoreThan6Months2026 || 'YES'}
            onChange={(val) => handleFieldChange('stayMoreThan6Months2026', (val || 'YES') as 'YES' | 'NO')}
          />

          <AppInput
            label={`Total Months Stayed in U.S. during ${selectedTaxYear} (0-12) *`}
            type="number"
            placeholder="12"
            error={errors.monthsStayedInUs2025}
            value={d.monthsStayedInUs2025 !== undefined ? d.monthsStayedInUs2025.toString() : '12'}
            onChange={(e) => {
              const raw = parseInt(e.target.value, 10);
              const clamped = isNaN(raw) ? 0 : Math.min(12, Math.max(0, raw));
              handleFieldChange('monthsStayedInUs2025', clamped);
            }}
          />
        </div>
      </div>

      {/* 3. Marital Status & Current Address Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppSelect
            label="Filing / Marital Status *"
            options={[
              { label: 'Single', value: 'Single' },
              { label: 'Married', value: 'Married' },
              { label: 'Married Filing Separately', value: 'Married Filing Separately' },
              { label: 'Head of Household', value: 'Head of Household' },
              { label: 'Widowed / Qualifying Surviving Spouse', value: 'Widowed' },
            ]}
            error={errors.maritalStatus}
            value={
              d.maritalStatus === 'Married Filing Jointly' || d.maritalStatus === 'Married'
                ? 'Married'
                : (d.maritalStatus || '')
            }
            onChange={(val) => {
              const selectedMarital = val || '';
              handleFieldChange('maritalStatus', selectedMarital);
              if (!selectedMarital.includes('Married')) {
                handleFieldChange('dateOfMarriage', '');
                if (clearError) clearError('dateOfMarriage');
              }
            }}
            placeholder="Select Marital Status"
          />

          <AppDatePicker
            label="Date of Marriage (MM/DD/YYYY)"
            placeholder={d.maritalStatus?.includes('Married') ? 'MM/DD/YYYY' : 'N/A - Single / Not Married'}
            format="MM/dd/yyyy"
            accentColor="#16A34A"
            maxDate={new Date()}
            error={errors.dateOfMarriage}
            disabled={!d.maritalStatus?.includes('Married')}
            value={parseUsDate(d.dateOfMarriage)}
            onChange={(dateVal) => handleFieldChange('dateOfMarriage', formatUsDate(dateVal))}
          />
        </div>

        {/* Spouse Error Alert if Married and missing fields */}
        {errors.spouse_general && isMarried && (
          <div className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errors.spouse_general}</span>
          </div>
        )}

        {/* Spouse Form Fields (Directly below Marital Status when Married is selected) */}
        {isMarried && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="text-xs font-semibold text-gray-700">
                Spouse / Joint Filer Details
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Spouse legal name, DOB, SSN, occupation and visa status
              </p>
            </div>

            <div className="space-y-4">
              {/* Row 1: Spouse First Name, Middle Name, Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AppInput
                  label="Spouse First Name (as per SSN) *"
                  placeholder="e.g. Priya"
                  error={errors['spouse_0_firstName'] || errors.spouseFirstName}
                  value={spouse.firstName || ''}
                  onChange={(e) => handleSpouseChange('firstName', e.target.value, 'spouse_0_firstName')}
                />

                <AppInput
                  label="Spouse Middle Name"
                  placeholder="e.g. Lakshmi (Optional)"
                  value={spouse.middleName || ''}
                  onChange={(e) => handleSpouseChange('middleName', e.target.value)}
                />

                <AppInput
                  label="Spouse Last Name (as per SSN) *"
                  placeholder="e.g. Varma"
                  error={errors['spouse_0_lastName'] || errors.spouseLastName}
                  value={spouse.lastName !== undefined ? spouse.lastName : (displayLastName || '')}
                  onChange={(e) => handleSpouseChange('lastName', e.target.value, 'spouse_0_lastName')}
                />
              </div>

              {/* Row 2: Spouse DOB, SSN, Visa Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AppDatePicker
                  label="Spouse Date of Birth (MM/DD/YYYY) *"
                  placeholder="MM/DD/YYYY"
                  format="MM/dd/yyyy"
                  accentColor="#16A34A"
                  maxDate={new Date()}
                  error={errors['spouse_0_dob'] || errors.spouseDob}
                  value={parseUsDate(spouse.dob)}
                  onChange={(dVal) => handleSpouseChange('dob', formatUsDate(dVal), 'spouse_0_dob')}
                />

                <AppInput
                  label="Spouse SSN / ITIN (Editable) *"
                  type="password"
                  placeholder="982-14-9812"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  error={errors['spouse_0_ssn'] || errors.spouseSsn}
                  value={formatSsn(spouse.ssn)}
                  onChange={(e) => handleSpouseChange('ssn', formatSsn(e.target.value), 'spouse_0_ssn')}
                />

                <AppSelect
                  label={`Spouse VISA Type as of 12/31/${selectedTaxYear}`}
                  options={[
                    { label: 'H-4 (Dependent)', value: 'H-4' },
                    { label: 'H-4 EAD (Work Authorized)', value: 'H-4 EAD' },
                    { label: 'H-1B (Specialty Worker)', value: 'H-1B' },
                    { label: 'L-2 (Dependent)', value: 'L-2' },
                    { label: 'L-2 EAD (Work Authorized)', value: 'L-2 EAD' },
                    { label: 'F-1 OPT (Student)', value: 'F-1 OPT' },
                    { label: 'Green Card / Citizen', value: 'GREEN_CARD' },
                    { label: 'B-2 / Other Visa', value: 'OTHER' },
                  ]}
                  value={spouse.visaType || 'H-4 EAD'}
                  onChange={(val) => handleSpouseChange('visaType', val || 'H-4 EAD')}
                />
              </div>

              {/* Row 3: Spouse Occupation, Work / Mobile Phone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AppInput
                  label="Spouse Occupation *"
                  placeholder="e.g. Financial Analyst or Homemaker"
                  leftIcon={<Briefcase className="w-4 h-4" />}
                  error={errors['spouse_0_occupation'] || errors.spouseOccupation}
                  value={spouse.occupation || ''}
                  onChange={(e) => handleSpouseChange('occupation', e.target.value, 'spouse_0_occupation')}
                />

                <AppInput
                  label="Spouse Work / Mobile Phone"
                  placeholder="+1 (713) 555-0921"
                  leftIcon={<Phone className="w-4 h-4" />}
                  value={spouse.workPhone || ''}
                  onChange={(e) => handleSpouseChange('workPhone', e.target.value)}
                />

                <AppInput
                  label="Spouse Email Address"
                  placeholder="spouse@domain.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={spouse.email || ''}
                  onChange={(e) => handleSpouseChange('email', e.target.value)}
                />
              </div>

              {/* Row 4: Spouse Residential Address */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 select-none">
                    <input
                      type="checkbox"
                      checked={spouse.sameAddressAsTaxpayer !== false}
                      onChange={(e) => handleSpouseChange('sameAddressAsTaxpayer', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#16A34A] focus:ring-[#16A34A] cursor-pointer"
                    />
                    <span>Spouse residential address is same as taxpayer</span>
                  </label>
                  {spouse.sameAddressAsTaxpayer !== false && d.residentialAddress && (
                    <span className="text-[11px] text-slate-500 italic truncate max-w-xs hidden sm:inline">
                      {d.residentialAddress}, {d.city || ''}, {d.state || ''} {d.zipCode || ''}
                    </span>
                  )}
                </div>

                {spouse.sameAddressAsTaxpayer === false && (
                  <div className="space-y-3 p-3.5 rounded-lg bg-slate-50/80 border border-slate-200 animate-in fade-in duration-150">
                    <div className="text-[11px] font-semibold text-slate-700">
                      Separate Spouse Residential Address
                    </div>
                    <div>
                      <AppInput
                        label="Spouse Current Residential Street Address *"
                        placeholder="e.g. 200 Park Ave, Apt 14B"
                        leftIcon={<Home className="w-4 h-4" />}
                        error={errors['spouse_0_residentialAddress'] || errors.spouseResidentialAddress}
                        value={spouse.residentialAddress || ''}
                        onChange={(e) => handleSpouseChange('residentialAddress', e.target.value, 'spouse_0_residentialAddress')}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <AppInput
                        label="Spouse City *"
                        placeholder="e.g. New York"
                        error={errors['spouse_0_city'] || errors.spouseCity}
                        value={spouse.city || ''}
                        onChange={(e) => handleSpouseChange('city', e.target.value, 'spouse_0_city')}
                      />
                      <AppSelect
                        label="Spouse State *"
                        options={US_STATE_OPTIONS}
                        searchable={true}
                        placeholder="Select State"
                        error={errors['spouse_0_state'] || errors.spouseState}
                        value={spouse.state || ''}
                        onChange={(val) => handleSpouseChange('state', val || '', 'spouse_0_state')}
                      />
                      <AppInput
                        label="Spouse ZIP Code *"
                        placeholder="e.g. 10017"
                        error={errors['spouse_0_zipCode'] || errors.spouseZipCode}
                        value={spouse.zipCode || ''}
                        onChange={(e) => handleSpouseChange('zipCode', e.target.value.slice(0, 10), 'spouse_0_zipCode')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <AppInput
            label="Current Residential Street Address *"
            placeholder="e.g. 1000 Louisiana St, Suite 4200"
            leftIcon={<Home className="w-4 h-4" />}
            error={errors.residentialAddress}
            value={d.residentialAddress || ''}
            onChange={(e) => handleFieldChange('residentialAddress', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AppInput
            label="City *"
            placeholder="e.g. Houston"
            error={errors.city}
            value={d.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
          />

          <AppSelect
            label="State *"
            options={US_STATE_OPTIONS}
            searchable={true}
            placeholder="Select State"
            error={errors.state}
            value={d.state || ''}
            onChange={(val) => handleFieldChange('state', val || '')}
          />

          <AppInput
            label="ZIP Code *"
            placeholder="e.g. 77002"
            error={errors.zipCode}
            value={d.zipCode || ''}
            onChange={(e) => handleFieldChange('zipCode', e.target.value.slice(0, 10))}
          />
        </div>
      </div>
    </div>
  );
};
