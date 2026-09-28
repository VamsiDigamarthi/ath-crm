import React from 'react';
import { Plus, Trash2, Gauge, DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { AppSelect } from '@/shared/components/AppSelect';
import { AppDatePicker } from '@/shared/components/AppDatePicker';
import { parseUsDate, formatUsDate } from '../utils/organizer-date-helpers';
import { type BusinessVehicleItem } from '../../../services/customer-api';

interface BusinessExpenseVehicleProps {
  hasVehicle?: boolean;
  onToggleHasVehicle: (val: boolean) => void;
  vehicles?: BusinessVehicleItem[];
  onChangeVehicles: (vehicles: BusinessVehicleItem[]) => void;
  errors?: Record<string, string>;
}

export const BusinessExpenseVehicle: React.FC<BusinessExpenseVehicleProps> = ({
  hasVehicle = false,
  onToggleHasVehicle,
  vehicles = [],
  onChangeVehicles,
  errors = {},
}) => {
  const handleAddVehicle = () => {
    const newVeh: BusinessVehicleItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      vehicleDescription: '',
      datePlacedInService: '',
      totalMiles: 0,
      businessMiles: 0,
      commutingMiles: 0,
      personalMiles: 0,
      calculationMethod: 'STANDARD',
      gasOilExpenses: 0,
      repairsMaintenance: 0,
      insuranceLease: 0,
      parkingAndTolls: 0,
      isAnotherPersonalVehicle: 'YES',
      hasWrittenEvidence: 'YES',
    };
    onChangeVehicles([...vehicles, newVeh]);
  };

  const handleRemoveVehicle = (index: number) => {
    const updated = vehicles.filter((_, idx) => idx !== index);
    onChangeVehicles(updated);
  };

  const handleUpdateVehicle = <K extends keyof BusinessVehicleItem>(
    index: number,
    field: K,
    val: BusinessVehicleItem[K]
  ) => {
    const updated = [...vehicles];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChangeVehicles(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Toggle & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="w-full sm:w-64">
          <AppSelect
            label="Claim Vehicle Deductions?"
            options={[
              { label: 'No - No Business Vehicles Used', value: 'NO' },
              { label: 'Yes - Claim Vehicle Deduction', value: 'YES' },
            ]}
            value={hasVehicle ? 'YES' : 'NO'}
            onChange={(val) => {
              const active = val === 'YES';
              onToggleHasVehicle(active);
              if (active && vehicles.length === 0) {
                handleAddVehicle();
              }
            }}
          />
        </div>

        {hasVehicle && (
          <button
            type="button"
            onClick={handleAddVehicle}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer shadow-2xs self-end"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Vehicle</span>
          </button>
        )}
      </div>

      {hasVehicle && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {vehicles.map((veh, idx) => (
            <div
              key={veh.id || idx}
              className="p-4 rounded-md border border-slate-200 bg-white shadow-2xs space-y-3.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  {veh.vehicleDescription || `Vehicle #${idx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveVehicle(idx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Row 1: Vehicle info, date in service, method, ownership questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <AppInput
                    label="Car Make &amp; Model *"
                    placeholder="e.g. 2022 Ford Transit 250"
                    error={errors[`vehicle_${idx}_desc`]}
                    value={veh.vehicleDescription || ''}
                    onChange={(e) => handleUpdateVehicle(idx, 'vehicleDescription', e.target.value)}
                    helperText="Please mention the car model number and year of manufacture."
                  />
                </div>

                <AppDatePicker
                  label="Date Placed in Service *"
                  placeholder="MM/DD/YYYY"
                  format="MM/dd/yyyy"
                  accentColor="#16A34A"
                  maxDate={new Date()}
                  value={parseUsDate(veh.datePlacedInService)}
                  onChange={(dVal) => handleUpdateVehicle(idx, 'datePlacedInService', formatUsDate(dVal))}
                />

                <AppSelect
                  label="Purchased on Business Name?"
                  options={[
                    { label: 'Yes - Under Company Name', value: 'YES' },
                    { label: 'No - Personal Name', value: 'NO' },
                  ]}
                  value={veh.isPurchasedOnBusinessName || 'NO'}
                  onChange={(val) => handleUpdateVehicle(idx, 'isPurchasedOnBusinessName', (val || 'NO') as any)}
                />

                <AppSelect
                  label="Used for Another Business?"
                  options={[
                    { label: 'No - Only This Business', value: 'NO' },
                    { label: 'Yes - Also Used Elsewhere', value: 'YES' },
                  ]}
                  value={veh.usedForAnotherBusiness || 'NO'}
                  onChange={(val) => handleUpdateVehicle(idx, 'usedForAnotherBusiness', (val || 'NO') as any)}
                />
              </div>

              {/* Row 2: Mileage breakdown & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <AppSelect
                  label="Deduction Method *"
                  options={[
                    { label: 'Standard Mileage (IRS standard rate/mile)', value: 'STANDARD' },
                    { label: 'Actual Expenses (Gas, repairs, lease, etc.)', value: 'ACTUAL' },
                  ]}
                  value={veh.calculationMethod || 'STANDARD'}
                  onChange={(val) => handleUpdateVehicle(idx, 'calculationMethod', (val || 'STANDARD') as any)}
                />

                <AppInput
                  label="Total Miles (Business + Personal) *"
                  type="number"
                  placeholder="15000"
                  leftIcon={<Gauge className="w-3.5 h-3.5" />}
                  value={veh.totalMiles !== undefined && veh.totalMiles !== 0 ? veh.totalMiles.toString() : ''}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    handleUpdateVehicle(idx, 'totalMiles', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Total miles driven by car in tax filing year."
                />

                <AppInput
                  label="Business Related Miles *"
                  type="number"
                  placeholder="12000"
                  leftIcon={<Gauge className="w-3.5 h-3.5" />}
                  value={veh.businessMiles !== undefined && veh.businessMiles !== 0 ? veh.businessMiles.toString() : ''}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    handleUpdateVehicle(idx, 'businessMiles', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Total miles driven for this business."
                />

                <AppInput
                  label="Commuting Miles"
                  type="number"
                  placeholder="1000"
                  value={veh.commutingMiles !== undefined && veh.commutingMiles !== 0 ? veh.commutingMiles.toString() : ''}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    handleUpdateVehicle(idx, 'commutingMiles', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="Home to workplace"
                />

                <AppInput
                  label="Personal / Other Miles"
                  type="number"
                  placeholder="2000"
                  value={veh.personalMiles !== undefined && veh.personalMiles !== 0 ? veh.personalMiles.toString() : ''}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10);
                    handleUpdateVehicle(idx, 'personalMiles', isNaN(raw) ? 0 : raw);
                  }}
                />
              </div>

              {/* Actual Expenses (if chosen) */}
              {veh.calculationMethod === 'ACTUAL' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-md bg-amber-50/40 border border-amber-200">
                  <AppInput
                    label="Gas, Fuel, Oil &amp; Lubricants ($)"
                    type="number"
                    placeholder="0.00"
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    value={veh.gasOilExpenses !== undefined && veh.gasOilExpenses !== 0 ? veh.gasOilExpenses.toString() : ''}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      handleUpdateVehicle(idx, 'gasOilExpenses', isNaN(raw) ? 0 : raw);
                    }}
                  />

                  <AppInput
                    label="Auto Repairs &amp; Maintenance ($)"
                    type="number"
                    placeholder="0.00"
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    value={veh.repairsMaintenance !== undefined && veh.repairsMaintenance !== 0 ? veh.repairsMaintenance.toString() : ''}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      handleUpdateVehicle(idx, 'repairsMaintenance', isNaN(raw) ? 0 : raw);
                    }}
                  />

                  <AppInput
                    label="Auto Insurance &amp; Lease Payments ($)"
                    type="number"
                    placeholder="0.00"
                    leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    value={veh.insuranceLease !== undefined && veh.insuranceLease !== 0 ? veh.insuranceLease.toString() : ''}
                    onChange={(e) => {
                      const raw = parseFloat(e.target.value);
                      handleUpdateVehicle(idx, 'insuranceLease', isNaN(raw) ? 0 : raw);
                    }}
                  />
                </div>
              )}

              {/* Parking & Tolls + Evidence questions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <AppInput
                  label="Business Parking Fees &amp; Highway Tolls ($)"
                  type="number"
                  placeholder="0.00"
                  leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                  value={veh.parkingAndTolls !== undefined && veh.parkingAndTolls !== 0 ? veh.parkingAndTolls.toString() : ''}
                  onChange={(e) => {
                    const raw = parseFloat(e.target.value);
                    handleUpdateVehicle(idx, 'parkingAndTolls', isNaN(raw) ? 0 : raw);
                  }}
                  helperText="100% deductible in addition to mileage rate"
                />

                <AppSelect
                  label="Was another personal vehicle available? *"
                  options={[
                    { label: 'Yes - Had personal vehicle', value: 'YES' },
                    { label: 'No - Single vehicle owned', value: 'NO' },
                  ]}
                  value={veh.isAnotherPersonalVehicle || 'YES'}
                  onChange={(val) => handleUpdateVehicle(idx, 'isAnotherPersonalVehicle', (val || 'YES') as any)}
                />

                <AppSelect
                  label="Do you have written log evidence? *"
                  options={[
                    { label: 'Yes - Written mileage log / app', value: 'YES' },
                    { label: 'No - Estimated mileage', value: 'NO' },
                  ]}
                  value={veh.hasWrittenEvidence || 'YES'}
                  onChange={(val) => handleUpdateVehicle(idx, 'hasWrittenEvidence', (val || 'YES') as any)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
