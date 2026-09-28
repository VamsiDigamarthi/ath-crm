import React from 'react';
import { 
  Home, 
  Briefcase, 
  Phone, 
  Mail, 
  CreditCard, 
  Plus, 
  Trash2, 
  AlertCircle,
  Building2,
  User,
  Users,
  Globe
} from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { AppAccordion, AppAccordionItem } from '@/shared/components/AppAccordion';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';
import { Module3Presence } from './Module3Presence';

interface Module1Props {
  data: OrganizerData['m1_demographics'];
  updateField: <K extends keyof OrganizerData['m1_demographics']>(field: K, value: OrganizerData['m1_demographics'][K]) => void;
  m2Data?: OrganizerData['m2_dependents'];
  updateM2Field?: <K extends keyof OrganizerData['m2_dependents']>(field: K, value: OrganizerData['m2_dependents'][K]) => void;
  m3Data?: OrganizerData['m3_presence'];
  updateM3Field?: <K extends keyof OrganizerData['m3_presence']>(field: K, value: OrganizerData['m3_presence'][K]) => void;
  m9Data?: OrganizerData['m9_directDeposit'];
  updateM9Field?: <K extends keyof OrganizerData['m9_directDeposit']>(field: K, value: OrganizerData['m9_directDeposit'][K]) => void;
  selectedTaxYear: number;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const Module1Demographics: React.FC<Module1Props> = ({
  data,
  updateField,
  m2Data,
  updateM2Field,
  m3Data,
  updateM3Field,
  m9Data,
  updateM9Field,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m1_demographics']>;
  const m2 = (m2Data || {}) as Partial<OrganizerData['m2_dependents']>;
  const m9 = (m9Data || {}) as Partial<OrganizerData['m9_directDeposit']>;

  const handleFieldChange = <K extends keyof OrganizerData['m1_demographics']>(
    field: K,
    value: OrganizerData['m1_demographics'][K]
  ) => {
    updateField(field, value);
    if (clearError) {
      clearError(field as string);
    }
  };

  const handleM2FieldChange = <K extends keyof OrganizerData['m2_dependents']>(
    field: K,
    value: OrganizerData['m2_dependents'][K],
    errorKey?: string
  ) => {
    if (updateM2Field) {
      updateM2Field(field, value);
    }
    if (errorKey && clearError) {
      clearError(errorKey);
    }
  };

  const handleM9FieldChange = <K extends keyof OrganizerData['m9_directDeposit']>(
    field: K,
    value: OrganizerData['m9_directDeposit'][K],
    errorKey?: string
  ) => {
    if (updateM9Field) {
      updateM9Field(field, value);
    }
    if (errorKey && clearError) {
      clearError(errorKey);
    }
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
    } else if (field === 'relationship') {
      updateM2Field('spouseRelationship', value);
    }

    // Keep single-element list for full backward compatibility
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
    <div className="space-y-4 font-sans">
      <AppAccordion defaultOpenIndex={0} allowMultiple={true}>
        {/* Accordion 1: General Information */}
        <AppAccordionItem
          index={0}
          title="General Information"
          icon={<User className="w-4 h-4" />}
        >
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
            value={d.ssnMasked || ''}
            onChange={(e) => handleFieldChange('ssnMasked', e.target.value)}
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

          {/* Visa Status Transition Details Box: rounded-md, no inner horizontal rule */}
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
                  value={spouse.ssn || ''}
                  onChange={(e) => handleSpouseChange('ssn', e.target.value, 'spouse_0_ssn')}
                />

                <AppSelect
                  label={`Spouse VISA Type as of 12/31/${selectedTaxYear}`}
                  options={[
                    { label: 'H-4 EAD (Work Authorized)', value: 'H-4 EAD' },
                    { label: 'H-1B (Specialty Worker)', value: 'H-1B' },
                    { label: 'L-2 / L-2 EAD (Dependent)', value: 'L-2' },
                    { label: 'F-1 OPT (Student)', value: 'F-1 OPT' },
                    { label: 'Green Card / Citizen', value: 'GREEN_CARD' },
                    { label: 'B-2 / Other Visa', value: 'OTHER' },
                  ]}
                  value={spouse.visaType || 'H-4 EAD'}
                  onChange={(val) => handleSpouseChange('visaType', val || 'H-4 EAD')}
                />
              </div>

              {/* Row 3: Spouse Occupation & Work / Mobile Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <AppInput
            label="State (2-Letter Code) *"
            placeholder="e.g. TX"
            error={errors.state}
            value={d.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value.toUpperCase().slice(0, 2))}
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
    </AppAccordionItem>

    {/* Accordion 2: Dependents */}
    <AppAccordionItem
      index={1}
      title="Dependents"
      icon={<Users className="w-4 h-4" />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-gray-700">Family Members &amp; Dependents</span>
          <button
            type="button"
            onClick={() => {
              const currentList = m2.dependentsList || [];
              const updated = [
                ...currentList,
                {
                  firstName: '',
                  middleName: '',
                  lastName: displayLastName || '',
                  name: '',
                  dob: '',
                  ssn: '',
                  relationship: 'Son',
                  monthsInHome: 12,
                },
              ];
              handleM2FieldChange('dependentsList', updated);
              handleM2FieldChange('childCount', updated.length);
            }}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{(m2.dependentsList || []).length > 0 ? 'Add Another Dependent' : 'Add Child / Dependent'}</span>
          </button>
        </div>

        {(m2.dependentsList || []).length === 0 && (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
            <Users className="w-7 h-7 mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-600 font-semibold">No dependents added</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Child / Dependent" if you have children or qualifying family members.</p>
          </div>
        )}

        {(m2.dependentsList || []).length > 0 && (
          <div className="space-y-6">
            {(m2.dependentsList || []).map((dep, idx) => (
              <div key={idx} className="space-y-4 pt-2 pb-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-xs font-semibold text-gray-700">Dependent #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const list = (m2.dependentsList || []).filter((_, i) => i !== idx);
                      handleM2FieldChange('dependentsList', list);
                      handleM2FieldChange('childCount', list.length);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                {/* Row 1: First Name, Middle Name, Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppInput
                    label="First Name (as per SSN) *"
                    placeholder="e.g. Aarav"
                    error={errors[`dep_${idx}_firstName`]}
                    value={dep.firstName || dep.name?.split(' ')[0] || ''}
                    onChange={(e) => {
                      const list = [...(m2.dependentsList || [])];
                      list[idx].firstName = e.target.value;
                      list[idx].name = `${e.target.value} ${list[idx].lastName || displayLastName || ''}`.trim();
                      handleM2FieldChange('dependentsList', list, `dep_${idx}_firstName`);
                    }}
                  />

                  <AppInput
                    label="Middle Name"
                    placeholder="e.g. V (Optional)"
                    value={dep.middleName || ''}
                    onChange={(e) => {
                      const list = [...(m2.dependentsList || [])];
                      list[idx].middleName = e.target.value;
                      handleM2FieldChange('dependentsList', list);
                    }}
                  />

                  <AppInput
                    label="Last Name (as per SSN) *"
                    placeholder="e.g. Varma"
                    error={errors[`dep_${idx}_lastName`]}
                    value={dep.lastName !== undefined ? dep.lastName : (displayLastName || '')}
                    onChange={(e) => {
                      const list = [...(m2.dependentsList || [])];
                      list[idx].lastName = e.target.value;
                      list[idx].name = `${list[idx].firstName || ''} ${e.target.value}`.trim();
                      handleM2FieldChange('dependentsList', list, `dep_${idx}_lastName`);
                    }}
                  />
                </div>

                {/* Row 2: Relationship, DOB, SSN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppSelect
                    label="Relationship With Primary Taxpayer *"
                    options={[
                      { label: 'Son (Child)', value: 'Son' },
                      { label: 'Daughter (Child)', value: 'Daughter' },
                      { label: 'Father (Parent)', value: 'Father' },
                      { label: 'Mother (Parent)', value: 'Mother' },
                      { label: 'Brother / Sister', value: 'Sibling' },
                      { label: 'Other Qualifying Relative', value: 'Other' },
                    ]}
                    value={dep.relationship || 'Son'}
                    onChange={(val) => {
                      const list = [...(m2.dependentsList || [])];
                      list[idx].relationship = val || 'Son';
                      handleM2FieldChange('dependentsList', list);
                    }}
                  />

                  <AppDatePicker
                    label="Date of Birth (MM/DD/YYYY) *"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    maxDate={new Date()}
                    error={errors[`dep_${idx}_dob`]}
                    value={parseUsDate(dep.dob)}
                    onChange={(dateVal) => {
                      const list = [...(m2.dependentsList || [])];
                      list[idx].dob = formatUsDate(dateVal);
                      handleM2FieldChange('dependentsList', list, `dep_${idx}_dob`);
                    }}
                  />

                  <AppInput
                    label="SSN / ITIN (Editable) *"
                    type="password"
                    placeholder="982-14-1234"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    error={errors[`dep_${idx}_ssn`]}
                    value={dep.ssn || ''}
                    onChange={(e) => {
                      const list = [...(m2.dependentsList || [])];
                      list[idx].ssn = e.target.value;
                      handleM2FieldChange('dependentsList', list, `dep_${idx}_ssn`);
                    }}
                  />
                </div>

                {/* Row 3: Months Lived in Home */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppInput
                    label="Months Lived in Home (0-12) *"
                    type="number"
                    placeholder="12"
                    error={errors[`dep_${idx}_monthsInHome`]}
                    value={dep.monthsInHome !== undefined ? dep.monthsInHome.toString() : '12'}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value, 10);
                      const clamped = isNaN(raw) ? 0 : Math.min(12, Math.max(0, raw));
                      const list = [...(m2.dependentsList || [])];
                      list[idx].monthsInHome = clamped;
                      handleM2FieldChange('dependentsList', list, `dep_${idx}_monthsInHome`);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppAccordionItem>

    {/* Accordion 3: State & Residency */}
    <AppAccordionItem
      index={2}
      title="State & Residency"
      icon={<Globe className="w-4 h-4" />}
    >
      <Module3Presence
        data={m3Data || ({} as any)}
        updateField={updateM3Field || (() => {})}
        selectedTaxYear={selectedTaxYear}
        errors={errors}
        clearError={clearError}
      />
    </AppAccordionItem>

    {/* Accordion 4: Bank Details */}
    <AppAccordionItem
      index={3}
      title="Bank Details"
      icon={<Building2 className="w-4 h-4" />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppInput
            label="Bank Name *"
            placeholder="e.g. JPMorgan Chase / Bank of America / Wells Fargo"
            leftIcon={<Building2 className="w-4 h-4" />}
            error={errors.bankName}
            value={m9.bankName || ''}
            onChange={(e) => handleM9FieldChange('bankName', e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 tracking-tight">Account Type *</label>
            <AppSelect
              options={[
                { label: 'Checking Account', value: 'CHECKING' },
                { label: 'Savings Account', value: 'SAVINGS' },
              ]}
              value={m9.accountType || 'CHECKING'}
              onChange={(val) => handleM9FieldChange('accountType', val || 'CHECKING')}
            />
          </div>

          <AppInput
            label="9-Digit Routing Number *"
            placeholder="e.g. 111000614"
            leftIcon={<CreditCard className="w-4 h-4" />}
            error={errors.routingNumber}
            value={m9.routingNumber || ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
              handleM9FieldChange('routingNumber', raw);
            }}
          />

          <AppInput
            label="Account Number *"
            placeholder="e.g. 849204819"
            leftIcon={<CreditCard className="w-4 h-4" />}
            error={errors.accountNumber}
            value={m9.accountNumber || ''}
            onChange={(e) => handleM9FieldChange('accountNumber', e.target.value)}
          />

          <div className="sm:col-span-2">
            <AppInput
              label="Account Owner Name (as appears on bank statement) *"
              placeholder="e.g. Taxpayer Full Name"
              error={errors.accountOwnerName}
              value={m9.accountOwnerName || (d.fullName || `${displayFirstName} ${displayLastName}`.trim())}
              onChange={(e) => handleM9FieldChange('accountOwnerName', e.target.value)}
            />
          </div>
        </div>

        {/* 6. Special Notes, Questions or Additional Information */}
        <div className="pt-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700 tracking-tight">
                Special Notes, Questions or Additional Information
              </label>
              <span
                className={`text-[11px] font-mono transition-colors ${
                  (m9.notesToPreparer || '').length > 5000
                    ? 'text-rose-600 font-extrabold'
                    : (m9.notesToPreparer || '').length > 4500
                    ? 'text-amber-600 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {(m9.notesToPreparer || '').length} / 5,000 chars
              </span>
            </div>

            <textarea
              rows={4}
              placeholder="Provide any feedback, special circumstances, or details for the tax preparer..."
              className={`w-full px-3 py-2 text-xs border rounded-md transition-all focus:outline-none leading-relaxed ${
                errors.notesToPreparer || (m9.notesToPreparer || '').length > 5000
                  ? 'border-rose-500 ring-1 ring-rose-200 bg-rose-50/20 text-black'
                  : 'border-slate-300 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] bg-white text-black'
              }`}
              value={m9.notesToPreparer || ''}
              onChange={(e) => handleM9FieldChange('notesToPreparer', e.target.value)}
            />

            {errors.notesToPreparer && (
              <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                <span>{errors.notesToPreparer}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </AppAccordionItem>
  </AppAccordion>
</div>
  );
};
