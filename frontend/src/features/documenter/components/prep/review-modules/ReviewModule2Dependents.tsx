import React from 'react';
import { Users, User, Receipt, Eye, EyeOff, Briefcase, Phone, Mail, Globe, Calendar, ShieldCheck, HeartHandshake } from 'lucide-react';
import { AppCopyButton } from '@/shared/components/AppCopyButton';

interface ReviewModule2DependentsProps {
  m2: any;
  showSensitive: Record<string, boolean>;
  toggleShow: (key: string) => void;
}

export const ReviewModule2Dependents: React.FC<ReviewModule2DependentsProps> = ({
  m2,
  showSensitive,
  toggleShow,
}) => {
  // Helper to display real value or clean dash '-'
  const val = (v: any) => {
    if (v === null || v === undefined || v === '') return '-';
    return String(v).trim() || '-';
  };

  // Derived Spouses List
  const spouses = m2.spouseList && m2.spouseList.length > 0
    ? m2.spouseList
    : (m2.spouseFirstName || m2.spouseLastName || m2.spouseName ? [{
        firstName: m2.spouseFirstName || m2.spouseName?.split(' ')[0] || '',
        middleName: m2.spouseMiddleName || '',
        lastName: m2.spouseLastName || m2.spouseName?.split(' ').slice(1).join(' ') || '',
        dob: m2.spouseDob || '',
        ssn: m2.spouseSsn || '',
        occupation: m2.spouseOccupation || '',
        visaType: m2.spouseVisaType || 'H-4 EAD',
        workPhone: m2.spouseWorkPhone || '',
        email: m2.spouseEmail || '',
        relationship: m2.spouseRelationship || 'Spouse',
      }] : []);

  const dependents = m2.dependentsList || [];
  const daycareList = m2.daycareList || [];

  return (
    <div className="space-y-5 font-sans">
      {/* 1. Spouse Section */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold text-xs shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Spouse / Joint Filer Details ({spouses.length})
              </h5>
              <p className="text-[11px] text-slate-500">Full verified demographic, visa and employment profile</p>
            </div>
          </div>
        </div>

        {spouses.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-white">
            No spouse or joint filer details added yet (Taxpayer filed as Single / Head of Household).
          </div>
        ) : (
          <div className="space-y-4">
            {spouses.map((sp: any, idx: number) => {
              const ssnKey = `sp_${idx}`;
              const isRevealed = showSensitive[ssnKey];
              const displaySsn = sp.ssn
                ? (isRevealed ? sp.ssn : (sp.ssn.includes('•') ? sp.ssn : `••••••-${sp.ssn.slice(-4)}`))
                : '-';

              const spouseFullName = [sp.firstName, sp.middleName, sp.lastName].filter(Boolean).join(' ') || sp.name || '-';

              return (
                <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
                  {/* Card Top Title Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {spouseFullName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center gap-1">
                        <HeartHandshake className="w-3 h-3" />
                        <span>{val(sp.relationship) || 'Spouse'}</span>
                      </span>
                    </div>

                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-600" />
                      <span>VISA: {val(sp.visaType) || 'H-4 EAD'}</span>
                    </span>
                  </div>

                  {/* 8 Full Demographic Grid Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                    {/* 1. First Name */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px]">Spouse First Name</span>
                      <span className={`font-bold block ${sp.firstName ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(sp.firstName)}
                      </span>
                    </div>

                    {/* 2. Middle Name */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px]">Spouse Middle Name</span>
                      <span className={`font-bold block ${sp.middleName ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(sp.middleName)}
                      </span>
                    </div>

                    {/* 3. Last Name */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px]">Spouse Last Name</span>
                      <span className={`font-bold block ${sp.lastName ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(sp.lastName)}
                      </span>
                    </div>

                    {/* 4. Date of Birth */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Date of Birth (DOB)</span>
                      </span>
                      <span className={`font-bold block ${sp.dob ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(sp.dob)}
                      </span>
                    </div>

                    {/* 5. SSN / ITIN */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-slate-400" />
                        <span>SSN / ITIN</span>
                      </span>
                      <div className="flex items-center justify-between font-bold">
                        <span className={`font-mono ${sp.ssn ? 'text-slate-900' : 'text-slate-400'}`}>
                          {displaySsn}
                        </span>
                        {sp.ssn && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleShow(ssnKey)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                              title={isRevealed ? 'Hide SSN' : 'Show SSN'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <AppCopyButton text={sp.ssn} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 6. Occupation */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px] flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>Spouse Occupation</span>
                      </span>
                      <span className={`font-bold block ${sp.occupation ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(sp.occupation)}
                      </span>
                    </div>

                    {/* 7. Work / Mobile Phone */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>Work / Mobile Phone</span>
                      </span>
                      <span className={`font-bold block ${sp.workPhone ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(sp.workPhone)}
                      </span>
                    </div>

                    {/* 8. Email Address */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      <span className="text-slate-400 font-medium block text-[10px] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Email Address</span>
                      </span>
                      <span className={`font-bold block truncate ${sp.email ? 'text-slate-900' : 'text-slate-400'}`} title={sp.email}>
                        {val(sp.email)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Dependents Section */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Qualifying Children &amp; Dependents ({dependents.length})
              </h5>
              <p className="text-[11px] text-slate-500">Child Tax Credit ($2,000/child) and other eligible family members</p>
            </div>
          </div>
        </div>

        {dependents.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-white">
            No qualifying children or dependents claimed on return.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dependents.map((dep: any, idx: number) => {
              const depSsnKey = `dep_${idx}`;
              const isRevealed = showSensitive[depSsnKey];
              const displaySsn = dep.ssn
                ? (isRevealed ? dep.ssn : (dep.ssn.includes('•') ? dep.ssn : `••••••-${dep.ssn.slice(-4)}`))
                : '-';

              const depFullName = [dep.firstName, dep.middleName, dep.lastName].filter(Boolean).join(' ') || dep.name || '-';

              return (
                <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <span className="text-sm font-extrabold">{depFullName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {val(dep.relationship) || 'Child'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                      <span className="text-slate-400 text-[10px]">First Name:</span>
                      <span className={`font-bold ${dep.firstName ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(dep.firstName)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                      <span className="text-slate-400 text-[10px]">Middle Name:</span>
                      <span className={`font-bold ${dep.middleName ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(dep.middleName)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                      <span className="text-slate-400 text-[10px]">Last Name:</span>
                      <span className={`font-bold ${dep.lastName ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(dep.lastName)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                      <span className="text-slate-400 text-[10px]">Date of Birth:</span>
                      <span className={`font-bold ${dep.dob ? 'text-slate-900' : 'text-slate-400'}`}>
                        {val(dep.dob)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-0.5 border-b border-slate-50">
                      <span className="text-slate-400 text-[10px]">SSN / ITIN:</span>
                      <div className="flex items-center gap-1 font-mono font-bold">
                        <span className={dep.ssn ? 'text-slate-900' : 'text-slate-400'}>
                          {displaySsn}
                        </span>
                        {dep.ssn && (
                          <>
                            <button
                              type="button"
                              onClick={() => toggleShow(depSsnKey)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                              title={isRevealed ? 'Hide SSN' : 'Show SSN'}
                            >
                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <AppCopyButton text={dep.ssn} size="sm" />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-400 text-[10px]">Months in Home:</span>
                      <span className="font-extrabold text-emerald-700">
                        {dep.monthsInHome !== undefined ? `${dep.monthsInHome} Months` : '12 Months'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Daycare Expenses Section */}
      {daycareList.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Child &amp; Daycare Care Expenses Worksheet ({daycareList.length})
                </h5>
                <p className="text-[11px] text-slate-500">Child &amp; Dependent Care Credit (Form 2441)</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Dependent Child</th>
                  <th className="p-3">Daycare / Provider Name</th>
                  <th className="p-3">Provider EIN / SSN</th>
                  <th className="p-3">Provider Street Address</th>
                  <th className="p-3 text-right">Amount Paid ($)</th>
                  <th className="p-3 text-right">Reimbursed ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daycareList.map((dc: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{val(dc.dependentName)}</td>
                    <td className="p-3 font-medium text-slate-800">{val(dc.providerName)}</td>
                    <td className="p-3 font-mono text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{val(dc.providerEinSsn)}</span>
                        {dc.providerEinSsn && <AppCopyButton text={dc.providerEinSsn} size="sm" />}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs truncate" title={dc.providerAddress}>
                      {val(dc.providerAddress)}
                    </td>
                    <td className="p-3 font-bold text-emerald-700 text-right">
                      ${Number(dc.amountPaid || 0).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-600 text-right">
                      ${Number(dc.employerReimbursed || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
