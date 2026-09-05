import React from 'react';
import { 
  HelpCircle, 
  User, 
  Users, 
  Building2, 
  Plus, 
  Trash2, 
  Briefcase, 
  Phone, 
  CreditCard,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module2Props {
  data: OrganizerData['m2_dependents'];
  updateField: <K extends keyof OrganizerData['m2_dependents']>(field: K, value: OrganizerData['m2_dependents'][K]) => void;
  selectedTaxYear: number;
  maritalStatus?: string;
  primaryTaxpayerLastName?: string;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module2Dependents: React.FC<Module2Props> = ({
  data,
  updateField,
  selectedTaxYear,
  maritalStatus,
  primaryTaxpayerLastName = '',
  errors = {},
  clearError,
}) => {
  // Resolve single spouse details smoothly
  const spouse = (data.spouseList && data.spouseList.length > 0)
    ? data.spouseList[0]
    : {
        firstName: data.spouseFirstName || data.spouseName?.split(' ')[0] || '',
        middleName: data.spouseMiddleName || '',
        lastName: data.spouseLastName || data.spouseName?.split(' ').slice(1).join(' ') || (maritalStatus?.includes('Married') ? primaryTaxpayerLastName : ''),
        dob: data.spouseDob || '',
        ssn: data.spouseSsn || '',
        occupation: data.spouseOccupation || '',
        visaType: data.spouseVisaType || 'H-4 EAD',
        workPhone: data.spouseWorkPhone || '',
        email: data.spouseEmail || '',
        relationship: data.spouseRelationship || 'Spouse',
      };

  const isMarried = maritalStatus?.includes('Married');

  const handleFieldChange = <K extends keyof OrganizerData['m2_dependents']>(
    field: K,
    value: OrganizerData['m2_dependents'][K],
    errorKey?: string
  ) => {
    updateField(field, value);
    if (errorKey && clearError) {
      clearError(errorKey);
    }
  };

  const handleSpouseChange = (field: string, value: any, errorKey?: string) => {
    const updatedSpouse = {
      ...spouse,
      [field]: value,
    };

    if (field === 'firstName') {
      updateField('spouseFirstName', value);
      updateField('spouseName', `${value} ${updatedSpouse.lastName || ''}`.trim());
    } else if (field === 'middleName') {
      updateField('spouseMiddleName', value);
    } else if (field === 'lastName') {
      updateField('spouseLastName', value);
      updateField('spouseName', `${updatedSpouse.firstName || ''} ${value}`.trim());
    } else if (field === 'dob') {
      updateField('spouseDob', value);
    } else if (field === 'ssn') {
      updateField('spouseSsn', value);
    } else if (field === 'occupation') {
      updateField('spouseOccupation', value);
    } else if (field === 'visaType') {
      updateField('spouseVisaType', value);
    } else if (field === 'workPhone') {
      updateField('spouseWorkPhone', value);
    } else if (field === 'relationship') {
      updateField('spouseRelationship', value);
    }

    // Keep single-element list for full backward compatibility
    updateField('spouseList', [updatedSpouse]);
    updateField('hasSpouse', true);

    if (errorKey && clearError) {
      clearError(errorKey);
    }
    if (clearError) {
      clearError('spouse_general');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Spouse &amp; Dependent Rules:</strong> Qualifying children under 17 receive up to <strong>$2,000/child Child Tax Credit</strong>. Daycare expenses can be claimed if spouse is working or full-time student.
        </div>
      </div>

      {/* General Spouse Error Banner if Married but Incomplete */}
      {errors.spouse_general && isMarried && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-bold">{errors.spouse_general}</span>
        </div>
      )}

      {/* Single Spouse / Joint Filer Details Card */}
      <div className={`p-4 sm:p-5 rounded-xl border bg-white space-y-4 ${
        errors.spouse_general && isMarried ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Spouse / Joint Filer Details</span>
              {isMarried ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Required for {maritalStatus}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  Optional (Single / Not Married)
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Spouse legal name, DOB, SSN, occupation and visa status</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Row 1: First Name, Middle Name, Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AppInput
              label={`Spouse First Name (as per SSN) ${isMarried ? '*' : ''}`}
              placeholder="e.g. Priya"
              error={errors['spouse_0_firstName'] || errors.spouseFirstName}
              value={spouse.firstName || ''}
              onChange={(e) => handleSpouseChange('firstName', e.target.value, 'spouse_0_firstName')}
            />

            <AppInput
              label="Spouse Middle Name"
              placeholder="e.g. Lakshmi"
              value={spouse.middleName || ''}
              onChange={(e) => handleSpouseChange('middleName', e.target.value)}
            />

            <AppInput
              label={`Spouse Last Name (as per SSN) ${isMarried ? '*' : ''}`}
              placeholder="e.g. Varma"
              error={errors['spouse_0_lastName'] || errors.spouseLastName}
              value={spouse.lastName !== undefined ? spouse.lastName : (primaryTaxpayerLastName || '')}
              onChange={(e) => handleSpouseChange('lastName', e.target.value, 'spouse_0_lastName')}
            />
          </div>

          {/* Row 2: DOB, SSN/ITIN, Visa Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AppDatePicker
              label={`Spouse Date of Birth (MM/DD/YYYY) ${isMarried ? '*' : ''}`}
              placeholder="MM/DD/YYYY"
              format="MM/dd/yyyy"
              accentColor="#16A34A"
              maxDate={new Date()}
              error={errors['spouse_0_dob'] || errors.spouseDob}
              value={parseUsDate(spouse.dob)}
              onChange={(d) => handleSpouseChange('dob', formatUsDate(d), 'spouse_0_dob')}
            />

            <AppInput
              label={`Spouse SSN / ITIN (Editable) ${isMarried ? '*' : ''}`}
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

          {/* Row 3: Occupation & Work Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AppInput
              label={`Spouse Occupation ${isMarried ? '*' : ''}`}
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

      {/* Qualifying Children & Dependents Table */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Qualifying Children &amp; Dependents</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Child 1, Child 2, and other elderly dependent family members</p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentList = data.dependentsList || [];
              const updated = [
                ...currentList,
                {
                  firstName: '',
                  middleName: '',
                  lastName: primaryTaxpayerLastName,
                  name: '',
                  dob: '',
                  ssn: '',
                  relationship: 'Son',
                  monthsInHome: 12,
                },
              ];
              handleFieldChange('dependentsList', updated);
              handleFieldChange('childCount', updated.length);
            }}
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child / Dependent</span>
          </Button>
        </div>

        {(data.dependentsList || []).length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No children or dependents added yet. Click &quot;Add Child / Dependent&quot; to claim Child Tax Credits.
          </div>
        ) : (
          <div className="space-y-4">
            {(data.dependentsList || []).map((dep, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold text-slate-900">Dependent #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const list = (data.dependentsList || []).filter((_, i) => i !== idx);
                      handleFieldChange('dependentsList', list);
                      handleFieldChange('childCount', list.length);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AppInput
                    label="First Name (as per SSN) *"
                    placeholder="e.g. Aarav"
                    error={errors[`dep_${idx}_firstName`]}
                    value={dep.firstName || dep.name?.split(' ')[0] || ''}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].firstName = e.target.value;
                      list[idx].name = `${e.target.value} ${list[idx].lastName || primaryTaxpayerLastName || ''}`.trim();
                      handleFieldChange('dependentsList', list, `dep_${idx}_firstName`);
                    }}
                  />

                  <AppInput
                    label="Middle Name"
                    placeholder="e.g. V (Optional)"
                    value={dep.middleName || ''}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].middleName = e.target.value;
                      handleFieldChange('dependentsList', list);
                    }}
                  />

                  <AppInput
                    label="Last Name (as per SSN) *"
                    placeholder="e.g. Varma"
                    error={errors[`dep_${idx}_lastName`]}
                    value={dep.lastName !== undefined ? dep.lastName : (primaryTaxpayerLastName || '')}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].lastName = e.target.value;
                      list[idx].name = `${list[idx].firstName || ''} ${e.target.value}`.trim();
                      handleFieldChange('dependentsList', list, `dep_${idx}_lastName`);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                      const list = [...(data.dependentsList || [])];
                      list[idx].relationship = val || 'Son';
                      handleFieldChange('dependentsList', list);
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
                    onChange={(d) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].dob = formatUsDate(d);
                      handleFieldChange('dependentsList', list, `dep_${idx}_dob`);
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
                      const list = [...(data.dependentsList || [])];
                      list[idx].ssn = e.target.value;
                      handleFieldChange('dependentsList', list, `dep_${idx}_ssn`);
                    }}
                  />

                  <AppInput
                    label="Months Lived in Home (0-12) *"
                    type="number"
                    placeholder="12"
                    error={errors[`dep_${idx}_monthsInHome`]}
                    value={dep.monthsInHome !== undefined ? dep.monthsInHome.toString() : '12'}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value, 10);
                      const clamped = isNaN(raw) ? 0 : Math.min(12, Math.max(0, raw));
                      const list = [...(data.dependentsList || [])];
                      list[idx].monthsInHome = clamped;
                      handleFieldChange('dependentsList', list, `dep_${idx}_monthsInHome`);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Child & Dependent Daycare Expenses Worksheet */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Child &amp; Daycare Care Expenses Worksheet</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Daycare, preschool, or babysitter paid while parents worked</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const list = data.daycareList || [];
              handleFieldChange('daycareList', [
                ...list,
                {
                  dependentName: '',
                  providerName: '',
                  providerEinSsn: '',
                  providerAddress: '',
                  amountPaid: 0,
                  employerReimbursed: 0,
                },
              ]);
              handleFieldChange('daycareExpensesClaimed', true);
            }}
            className="text-xs font-bold border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Daycare Provider</span>
          </Button>
        </div>

        {(data.daycareList || []).length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No daycare expenses claimed. Click &quot;Add Daycare Provider&quot; to claim Child &amp; Dependent Care Credit.
          </div>
        ) : (
          <div className="space-y-4">
            {(data.daycareList || []).map((care, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold text-slate-900">Daycare Provider #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const list = (data.daycareList || []).filter((_, i) => i !== idx);
                      handleFieldChange('daycareList', list);
                      handleFieldChange('daycareExpensesClaimed', list.length > 0);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AppInput
                    label="Dependent Name for Whom Paid *"
                    placeholder="e.g. Aarav Varma"
                    error={errors[`daycare_${idx}_dependentName`]}
                    value={care.dependentName || ''}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].dependentName = e.target.value;
                      handleFieldChange('daycareList', list, `daycare_${idx}_dependentName`);
                    }}
                  />
                  <AppInput
                    label="Daycare Institution / Person Name *"
                    placeholder="e.g. Primrose School of Houston"
                    error={errors[`daycare_${idx}_providerName`]}
                    value={care.providerName || ''}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].providerName = e.target.value;
                      handleFieldChange('daycareList', list, `daycare_${idx}_providerName`);
                    }}
                  />
                  <AppInput
                    label="Federal ID / SSN of Provider (EIN) *"
                    placeholder="XX-XXXXXXX or SSN"
                    error={errors[`daycare_${idx}_providerEinSsn`]}
                    value={care.providerEinSsn || ''}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].providerEinSsn = e.target.value;
                      handleFieldChange('daycareList', list, `daycare_${idx}_providerEinSsn`);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <AppInput
                      label="Provider Address (Street, City, State, ZIP) *"
                      placeholder="e.g. 5200 University Dr, Houston, TX 77004"
                      error={errors[`daycare_${idx}_providerAddress`]}
                      value={care.providerAddress || ''}
                      onChange={(e) => {
                        const list = [...(data.daycareList || [])];
                        list[idx].providerAddress = e.target.value;
                        handleFieldChange('daycareList', list, `daycare_${idx}_providerAddress`);
                      }}
                    />
                  </div>
                  <AppInput
                    label="Total Amount Paid ($) *"
                    type="number"
                    placeholder="3600"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    error={errors[`daycare_${idx}_amountPaid`]}
                    value={care.amountPaid ? care.amountPaid.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].amountPaid = parseFloat(e.target.value) || 0;
                      handleFieldChange('daycareList', list, `daycare_${idx}_amountPaid`);
                    }}
                  />
                  <AppInput
                    label="Employer Reimbursed ($)"
                    type="number"
                    placeholder="0"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={care.employerReimbursed ? care.employerReimbursed.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].employerReimbursed = parseFloat(e.target.value) || 0;
                      handleFieldChange('daycareList', list);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
