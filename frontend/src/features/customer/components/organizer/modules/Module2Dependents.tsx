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
  DollarSign 
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type OrganizerData } from '../../../services/customer-api';

interface Module2Props {
  data: OrganizerData['m2_dependents'];
  updateField: <K extends keyof OrganizerData['m2_dependents']>(field: K, value: OrganizerData['m2_dependents'][K]) => void;
  selectedTaxYear: number;
}

export const Module2Dependents: React.FC<Module2Props> = ({
  data,
  updateField,
  selectedTaxYear,
}) => {
  // Compute active spouses list (fallback to legacy spouse fields if list is empty)
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

  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong>Spouse &amp; Dependent Rules:</strong> Qualifying children under 17 receive up to <strong>$2,000/child Child Tax Credit</strong>. Daycare expenses can be claimed if spouse is working or full-time student.
        </div>
      </div>

      {/* Dynamic Spouse / Joint Filer Details */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Spouse / Joint Filer Details</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Spouse legal name, DOB, SSN, occupation and visa status</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentSpouses = spouses && spouses.length > 0 ? [...spouses] : [];
              const updated = [
                ...currentSpouses,
                {
                  firstName: '',
                  middleName: '',
                  lastName: '',
                  dob: '',
                  ssn: '',
                  occupation: '',
                  visaType: 'H-4 EAD',
                  workPhone: '',
                  email: '',
                  relationship: 'Spouse',
                },
              ];
              updateField('spouseList', updated);
              updateField('hasSpouse', true);
              if (updated.length > 0) {
                updateField('spouseFirstName', updated[0].firstName);
                updateField('spouseLastName', updated[0].lastName);
                updateField('spouseName', `${updated[0].firstName} ${updated[0].lastName}`.trim());
                updateField('spouseDob', updated[0].dob);
                updateField('spouseSsn', updated[0].ssn);
              }
            }}
            className="text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Spouse Details</span>
          </Button>
        </div>

        {spouses.length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
            <p>No spouse or joint filer details added yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const updated = [{
                  firstName: '',
                  middleName: '',
                  lastName: '',
                  dob: '',
                  ssn: '',
                  occupation: '',
                  visaType: 'H-4 EAD',
                  workPhone: '',
                  email: '',
                  relationship: 'Spouse',
                }];
                updateField('spouseList', updated);
                updateField('hasSpouse', true);
              }}
              className="text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Spouse Details</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {spouses.map((sp, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {spouses.length > 1 ? `Spouse / Joint Filer #${idx + 1}` : 'Spouse / Joint Filer'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const list = spouses.filter((_, i) => i !== idx);
                      updateField('spouseList', list);
                      updateField('hasSpouse', list.length > 0);
                      if (list.length > 0) {
                        updateField('spouseFirstName', list[0].firstName);
                        updateField('spouseLastName', list[0].lastName);
                        updateField('spouseName', `${list[0].firstName} ${list[0].lastName}`.trim());
                        updateField('spouseDob', list[0].dob);
                        updateField('spouseSsn', list[0].ssn);
                      } else {
                        updateField('spouseFirstName', '');
                        updateField('spouseLastName', '');
                        updateField('spouseName', '');
                        updateField('spouseDob', '');
                        updateField('spouseSsn', '');
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppInput
                    label="Spouse First Name (as per SSN) *"
                    placeholder="e.g. Priya"
                    value={sp.firstName}
                    onChange={(e) => {
                      const list = [...spouses];
                      list[idx].firstName = e.target.value;
                      updateField('spouseList', list);
                      if (idx === 0) {
                        updateField('spouseFirstName', e.target.value);
                        updateField('spouseName', `${e.target.value} ${list[idx].lastName || ''}`.trim());
                      }
                    }}
                  />

                  <AppInput
                    label="Spouse Middle Name"
                    placeholder="e.g. Lakshmi"
                    value={sp.middleName || ''}
                    onChange={(e) => {
                      const list = [...spouses];
                      list[idx].middleName = e.target.value;
                      updateField('spouseList', list);
                      if (idx === 0) updateField('spouseMiddleName', e.target.value);
                    }}
                  />

                  <AppInput
                    label="Spouse Last Name (as per SSN) *"
                    placeholder="e.g. Krishnan"
                    value={sp.lastName}
                    onChange={(e) => {
                      const list = [...spouses];
                      list[idx].lastName = e.target.value;
                      updateField('spouseList', list);
                      if (idx === 0) {
                        updateField('spouseLastName', e.target.value);
                        updateField('spouseName', `${list[idx].firstName || ''} ${e.target.value}`.trim());
                      }
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppDatePicker
                    label="Spouse Date of Birth (MM/DD/YYYY) *"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    maxDate={new Date()}
                    value={parseUsDate(sp.dob)}
                    onChange={(d) => {
                      const list = [...spouses];
                      list[idx].dob = formatUsDate(d);
                      updateField('spouseList', list);
                      if (idx === 0) updateField('spouseDob', formatUsDate(d));
                    }}
                  />

                  <AppInput
                    label="Spouse SSN / ITIN (Editable) *"
                    type="password"
                    placeholder="982-14-9812"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    value={sp.ssn}
                    onChange={(e) => {
                      const list = [...spouses];
                      list[idx].ssn = e.target.value;
                      updateField('spouseList', list);
                      if (idx === 0) updateField('spouseSsn', e.target.value);
                    }}
                  />

                  <AppSelect
                    label="Relationship With Primary Taxpayer"
                    options={[
                      { label: 'Spouse (Married Partner)', value: 'SPOUSE' },
                      { label: 'Joint Tax Filer', value: 'JOINT_FILER' },
                    ]}
                    value={sp.relationship || 'SPOUSE'}
                    onChange={(val) => {
                      const list = [...spouses];
                      list[idx].relationship = val || 'SPOUSE';
                      updateField('spouseList', list);
                      if (idx === 0) updateField('spouseRelationship', val || 'SPOUSE');
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AppInput
                    label="Spouse Occupation"
                    placeholder="e.g. Financial Analyst"
                    leftIcon={<Briefcase className="w-4 h-4" />}
                    value={sp.occupation}
                    onChange={(e) => {
                      const list = [...spouses];
                      list[idx].occupation = e.target.value;
                      updateField('spouseList', list);
                      if (idx === 0) updateField('spouseOccupation', e.target.value);
                    }}
                  />

                  <AppSelect
                    label={`Spouse VISA Type as of 12/31/${selectedTaxYear}`}
                    options={[
                      { label: 'H-4 EAD (Work Authorized)', value: 'H-4 EAD' },
                      { label: 'H-1B (Specialty Worker)', value: 'H-1B' },
                      { label: 'L-2 / L-2 EAD (Dependent)', value: 'L-2' },
                      { label: 'F-1 OPT (Student)', value: 'F-1 OPT' },
                      { label: 'Green Card / Citizen', value: 'GREEN_CARD' },
                    ]}
                    value={sp.visaType || 'H-4 EAD'}
                    onChange={(val) => {
                      const list = [...spouses];
                      list[idx].visaType = val || 'H-4 EAD';
                      updateField('spouseList', list);
                      if (idx === 0) updateField('spouseVisaType', val || 'H-4 EAD');
                    }}
                  />

                  <AppInput
                    label="Spouse Work / Mobile Phone"
                    placeholder="+1 (713) 555-0921"
                    leftIcon={<Phone className="w-4 h-4" />}
                    value={sp.workPhone || ''}
                    onChange={(e) => {
                      const list = [...spouses];
                      list[idx].workPhone = e.target.value;
                      updateField('spouseList', list);
                      if (idx === 0) updateField('spouseWorkPhone', e.target.value);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
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
                  lastName: '',
                  name: '',
                  dob: '',
                  ssn: '',
                  relationship: 'Son',
                  monthsInHome: 12,
                },
              ];
              updateField('dependentsList', updated);
              updateField('childCount', updated.length);
            }}
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1"
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
                      updateField('dependentsList', list);
                      updateField('childCount', list.length);
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
                    value={dep.firstName || dep.name?.split(' ')[0] || ''}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].firstName = e.target.value;
                      list[idx].name = `${e.target.value} ${list[idx].lastName || ''}`.trim();
                      updateField('dependentsList', list);
                    }}
                  />

                  <AppInput
                    label="Middle Name"
                    placeholder="e.g. V (Optional)"
                    value={dep.middleName || ''}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].middleName = e.target.value;
                      updateField('dependentsList', list);
                    }}
                  />

                  <AppInput
                    label="Last Name (as per SSN) *"
                    placeholder="e.g. Krishnan"
                    value={dep.lastName || dep.name?.split(' ').slice(1).join(' ') || ''}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].lastName = e.target.value;
                      list[idx].name = `${list[idx].firstName || ''} ${e.target.value}`.trim();
                      updateField('dependentsList', list);
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
                      updateField('dependentsList', list);
                    }}
                  />

                  <AppDatePicker
                    label="Date of Birth (MM/DD/YYYY) *"
                    placeholder="MM/DD/YYYY"
                    format="MM/dd/yyyy"
                    accentColor="#16A34A"
                    maxDate={new Date()}
                    value={parseUsDate(dep.dob)}
                    onChange={(d) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].dob = formatUsDate(d);
                      updateField('dependentsList', list);
                    }}
                  />

                  <AppInput
                    label="SSN / ITIN (Editable) *"
                    type="password"
                    placeholder="982-14-1234"
                    leftIcon={<CreditCard className="w-4 h-4" />}
                    value={dep.ssn}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].ssn = e.target.value;
                      updateField('dependentsList', list);
                    }}
                  />

                  <AppInput
                    label="Months Lived with You in 2025 *"
                    type="number"
                    placeholder="12"
                    value={dep.monthsInHome.toString()}
                    onChange={(e) => {
                      const list = [...(data.dependentsList || [])];
                      list[idx].monthsInHome = parseInt(e.target.value, 10) || 12;
                      updateField('dependentsList', list);
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
              updateField('daycareList', [
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
            }}
            className="text-xs font-bold border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 flex items-center gap-1"
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AppInput
                    label="Dependent Name for Whom Paid *"
                    placeholder="e.g. Aarav Krishnan"
                    value={care.dependentName}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].dependentName = e.target.value;
                      updateField('daycareList', list);
                    }}
                  />
                  <AppInput
                    label="Daycare Institution / Person Name *"
                    placeholder="e.g. Primrose School of Houston"
                    value={care.providerName}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].providerName = e.target.value;
                      updateField('daycareList', list);
                    }}
                  />
                  <AppInput
                    label="Federal ID / SSN of Provider (EIN) *"
                    placeholder="XX-XXXXXXX or SSN"
                    value={care.providerEinSsn}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].providerEinSsn = e.target.value;
                      updateField('daycareList', list);
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <AppInput
                      label="Provider Address (Street, City, State, ZIP) *"
                      placeholder="e.g. 5200 University Dr, Houston, TX 77004"
                      value={care.providerAddress}
                      onChange={(e) => {
                        const list = [...(data.daycareList || [])];
                        list[idx].providerAddress = e.target.value;
                        updateField('daycareList', list);
                      }}
                    />
                  </div>
                  <AppInput
                    label="Total Amount Paid ($) *"
                    type="number"
                    placeholder="3600"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={care.amountPaid ? care.amountPaid.toString() : ''}
                    onChange={(e) => {
                      const list = [...(data.daycareList || [])];
                      list[idx].amountPaid = parseFloat(e.target.value) || 0;
                      updateField('daycareList', list);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <AppInput
                      label="Employer Reimbursed ($)"
                      type="number"
                      placeholder="0"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                      value={care.employerReimbursed ? care.employerReimbursed.toString() : ''}
                      onChange={(e) => {
                        const list = [...(data.daycareList || [])];
                        list[idx].employerReimbursed = parseFloat(e.target.value) || 0;
                        updateField('daycareList', list);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const list = (data.daycareList || []).filter((_, i) => i !== idx);
                        updateField('daycareList', list);
                      }}
                      className="p-2.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-slate-200 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
