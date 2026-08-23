import React from 'react';
import { Users, User, Receipt } from 'lucide-react';

interface ReviewModule2DependentsProps {
  m2: any;
  showSensitive: Record<string, boolean>;
}

export const ReviewModule2Dependents: React.FC<ReviewModule2DependentsProps> = ({
  m2,
  showSensitive,
}) => {
  // Derived Spouses List
  const spouses = m2.spouseList && m2.spouseList.length > 0
    ? m2.spouseList
    : (m2.spouseFirstName || m2.spouseName ? [{
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
    <div className="space-y-4 font-sans">
      {/* 1. Spouse Section */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Spouse / Joint Filer Details ({spouses.length})</span>
          </h5>
        </div>

        {spouses.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">No spouse reported (Filing as Single/Head of Household).</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {spouses.map((sp: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-100 pb-1">
                  <span>{sp.firstName} {sp.lastName || ''}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {sp.visaType || 'H-4 EAD'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">DOB:</span>
                    <span className="font-semibold">{sp.dob || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SSN:</span>
                    <span className="font-semibold">
                      {sp.ssn ? (showSensitive[`sp_${idx}`] ? sp.ssn : `••••••-${sp.ssn.slice(-4)}`) : 'Not Provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Occupation:</span>
                    <span className="font-semibold">{sp.occupation || 'Not Provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Work Phone:</span>
                    <span className="font-semibold">{sp.workPhone || 'Not Provided'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Dependents Section */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <User className="w-4 h-4 text-blue-600" />
          <span>Qualifying Dependents &amp; Child Tax Credit ({dependents.length})</span>
        </h5>
        {dependents.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">No qualifying dependents claimed.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dependents.map((dep: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-100 pb-1">
                  <span>{dep.firstName} {dep.lastName || ''}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {dep.relationship || 'Child'}
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">DOB:</span>
                    <span className="font-semibold">{dep.dob || 'Not Provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SSN:</span>
                    <span className="font-semibold">{dep.ssn ? `••••••-${dep.ssn.slice(-4)}` : 'Not Provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Months Lived in Home:</span>
                    <span className="font-bold text-emerald-700">{dep.monthsInHome || 12} Months</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Daycare Expenses Section */}
      {daycareList.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
          <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Receipt className="w-4 h-4 text-amber-600" />
            <span>Daycare &amp; Child Care Expenses Worksheet</span>
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden bg-white">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Child / Dependent</th>
                  <th className="p-2.5">Daycare Provider Name</th>
                  <th className="p-2.5">Provider EIN / SSN</th>
                  <th className="p-2.5">Amount Paid ($)</th>
                  <th className="p-2.5">Employer Reimbursed ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daycareList.map((dc: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{dc.dependentName}</td>
                    <td className="p-2.5">{dc.providerName}</td>
                    <td className="p-2.5 font-mono">{dc.providerEinSsn}</td>
                    <td className="p-2.5 font-bold text-emerald-700">${Number(dc.amountPaid || 0).toLocaleString()}</td>
                    <td className="p-2.5 font-semibold text-slate-600">${Number(dc.employerReimbursed || 0).toLocaleString()}</td>
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
