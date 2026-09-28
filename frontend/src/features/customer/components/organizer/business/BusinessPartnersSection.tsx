import React from 'react';
import { Plus, Trash2, AlertCircle, Percent, DollarSign, CreditCard } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { type BusinessPartnerItem } from '../../../services/customer-api';

interface BusinessPartnersSectionProps {
  partners?: BusinessPartnerItem[];
  onChange: (partners: BusinessPartnerItem[]) => void;
  errors?: Record<string, string>;
}

export const BusinessPartnersSection: React.FC<BusinessPartnersSectionProps> = ({
  partners = [],
  onChange,
  errors = {},
}) => {
  const handleAddPartner = () => {
    const newPartner: BusinessPartnerItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: '',
      title: 'Partner / Member',
      ssnOrEin: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      visaStatus: 'US_CITIZEN',
      ownershipPercentage: partners.length === 0 ? 100 : 0,
      isActiveMember: true,
      guaranteedPayments: 0,
      distributionsReceived: 0,
      capitalContributions: 0,
    };
    onChange([...partners, newPartner]);
  };

  const handleRemovePartner = (index: number) => {
    const updated = partners.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleUpdatePartner = <K extends keyof BusinessPartnerItem>(
    index: number,
    field: K,
    val: BusinessPartnerItem[K]
  ) => {
    const updated = [...partners];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex justify-end pb-1">
        <button
          type="button"
          onClick={handleAddPartner}
          className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Partner / Owner</span>
        </button>
      </div>

      {errors.totalOwnership && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errors.totalOwnership}</span>
        </div>
      )}

      {partners.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-200 rounded-md bg-slate-50/50">
          <p className="text-xs text-slate-700 font-semibold">No partners or shareholders added yet</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
            Click "Add Partner / Owner" to enter details for each partner or shareholder receiving a Form K-1.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {partners.map((partner, idx) => (
            <div
              key={partner.id || idx}
              className="p-4 rounded-md border border-slate-200 bg-white shadow-2xs space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  Partner #{idx + 1}: {partner.name || 'Unnamed Partner'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePartner(idx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Row 1: Name, Role, SSN/EIN, Ownership */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <AppInput
                  label="Legal Full Name *"
                  placeholder="e.g. Vikram Patel"
                  error={errors[`partner_${idx}_name`]}
                  value={partner.name || ''}
                  onChange={(e) => handleUpdatePartner(idx, 'name', e.target.value)}
                />

                <AppInput
                  label="Title / Official Role"
                  placeholder="e.g. Managing Member / 50% Partner"
                  value={partner.title || ''}
                  onChange={(e) => handleUpdatePartner(idx, 'title', e.target.value)}
                />

                <AppInput
                  label="SSN or ITIN / EIN *"
                  type="password"
                  placeholder="XXX-XX-XXXX"
                  leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                  value={partner.ssnOrEin || ''}
                  onChange={(e) => handleUpdatePartner(idx, 'ssnOrEin', e.target.value)}
                />

                <AppInput
                  label="Ownership % (Profit / Loss Share) *"
                  type="number"
                  placeholder="50"
                  leftIcon={<Percent className="w-3.5 h-3.5" />}
                  error={errors[`partner_${idx}_ownership`]}
                  value={partner.ownershipPercentage !== undefined ? partner.ownershipPercentage.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdatePartner(idx, 'ownershipPercentage', isNaN(raw) ? 0 : raw);
                  }}
                />
              </div>

              {/* Row 2: Visa Status, Member Activity, Street, City/State/Zip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <AppSelect
                  label="Visa / Residency Status *"
                  options={[
                    { label: 'U.S. Citizen', value: 'US_CITIZEN' },
                    { label: 'Green Card (Permanent Resident)', value: 'GREEN_CARD' },
                    { label: 'H-1B Visa', value: 'H-1B' },
                    { label: 'H-4 EAD', value: 'H-4 EAD' },
                    { label: 'L-1 Visa', value: 'L-1' },
                    { label: 'Foreign / Non-Resident Partner', value: 'NON_RESIDENT' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                  value={partner.visaStatus || 'US_CITIZEN'}
                  onChange={(val) => handleUpdatePartner(idx, 'visaStatus', val || 'US_CITIZEN')}
                />

                <AppSelect
                  label="Member Participation"
                  options={[
                    { label: 'Active (Material Participation)', value: 'ACTIVE' },
                    { label: 'Passive Investor', value: 'PASSIVE' },
                  ]}
                  value={partner.isActiveMember ? 'ACTIVE' : 'PASSIVE'}
                  onChange={(val) => handleUpdatePartner(idx, 'isActiveMember', val === 'ACTIVE')}
                />

                <div className="sm:col-span-2">
                  <AppInput
                    label="Residential Address (Street, City, State, ZIP)"
                    placeholder="e.g. 5400 Westheimer Rd, Houston, TX 77056"
                    value={partner.address || ''}
                    onChange={(e) => handleUpdatePartner(idx, 'address', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Guaranteed Payments, Distributions, Capital Contributions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <AppInput
                  label="Guaranteed Payments ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={partner.guaranteedPayments !== undefined && partner.guaranteedPayments !== 0 ? partner.guaranteedPayments.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdatePartner(idx, 'guaranteedPayments', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Salary-equivalent payments for services"
                />

                <AppInput
                  label="Distributions / Draws ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={partner.distributionsReceived !== undefined && partner.distributionsReceived !== 0 ? partner.distributionsReceived.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdatePartner(idx, 'distributionsReceived', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Owner withdrawals / dividend distributions"
                />

                <AppInput
                  label="Capital Contributions ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={partner.capitalContributions !== undefined && partner.capitalContributions !== 0 ? partner.capitalContributions.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdatePartner(idx, 'capitalContributions', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Cash/property contributed during the year"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
