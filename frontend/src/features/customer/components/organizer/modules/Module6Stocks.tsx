import React from 'react';
import { DollarSign, Plus, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';
import { type ValidationErrorMap } from '../utils/organizer-validation';

interface Module6Props {
  data: OrganizerData['m6_stocks'];
  updateField: <K extends keyof OrganizerData['m6_stocks']>(field: K, value: OrganizerData['m6_stocks'][K]) => void;
  selectedTaxYear: number;
  errors?: ValidationErrorMap;
  clearError?: (field: string) => void;
}

export const Module6Stocks: React.FC<Module6Props> = ({
  data,
  updateField,
  selectedTaxYear,
  errors = {},
  clearError,
}) => {
  const d = (data || {}) as Partial<OrganizerData['m6_stocks']>;
  const stockList = d.stocksList || [];

  const handleAddBroker = () => {
    const updated = [
      ...stockList,
      {
        brokerName: '',
        taxpayerGainLoss: 0,
        spouseGainLoss: 0,
        shortTermGainLoss: 0,
        longTermGainLoss: 0,
        totalProceeds: 0,
      },
    ];
    updateField('stocksList', updated);
  };

  const handleRemoveBroker = (idx: number) => {
    const updated = stockList.filter((_, i) => i !== idx);
    updateField('stocksList', updated);
  };

  const handleBrokerChange = (idx: number, field: string, val: any) => {
    const list = [...stockList];
    list[idx] = { ...list[idx], [field]: val };
    updateField('stocksList', list);
    if (clearError) clearError(`stocks_${idx}_${field}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Brokerage Accounts List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h5 className="text-xs font-semibold text-gray-700 tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Brokerage Accounts &amp; 1099-B Statements</span>
              {stockList.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] font-medium border border-emerald-200">
                  {stockList.length} Added
                </span>
              )}
            </h5>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add each brokerage account or crypto exchange traded during {selectedTaxYear}
            </p>
          </div>

          <Button
            size="sm"
            type="button"
            onClick={handleAddBroker}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{stockList.length > 0 ? 'Add Another Brokerage' : 'Add Brokerage Account'}</span>
          </Button>
        </div>

        {stockList.length > 0 && (
          <div className="space-y-6">
            {stockList.map((broker, idx) => (
              <div key={idx} className="space-y-3 pt-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Brokerage Statement #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBroker(idx)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AppInput
                    label="Broker / Institution Name *"
                    placeholder="e.g. Robinhood / Fidelity / Schwab / E*Trade"
                    error={errors[`stocks_${idx}_brokerName`]}
                    value={broker.brokerName || ''}
                    onChange={(e) => handleBrokerChange(idx, 'brokerName', e.target.value)}
                  />

                  <AppInput
                    label="Taxpayer Net Gain / (Loss) ($)"
                    type="number"
                    placeholder="e.g. 2400 (or -850)"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={broker.taxpayerGainLoss ? broker.taxpayerGainLoss.toString() : ''}
                    onChange={(e) => handleBrokerChange(idx, 'taxpayerGainLoss', parseFloat(e.target.value) || 0)}
                  />

                  <AppInput
                    label="Spouse Net Gain / (Loss) ($)"
                    type="number"
                    placeholder="e.g. 1200 (or -350)"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={broker.spouseGainLoss ? broker.spouseGainLoss.toString() : ''}
                    onChange={(e) => handleBrokerChange(idx, 'spouseGainLoss', parseFloat(e.target.value) || 0)}
                  />

                  <AppInput
                    label="Short-Term Realized Gain/Loss ($)"
                    type="number"
                    placeholder="e.g. 1500"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={broker.shortTermGainLoss ? broker.shortTermGainLoss.toString() : ''}
                    onChange={(e) => handleBrokerChange(idx, 'shortTermGainLoss', parseFloat(e.target.value) || 0)}
                  />

                  <AppInput
                    label="Long-Term Realized Gain/Loss ($)"
                    type="number"
                    placeholder="e.g. 3200"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={broker.longTermGainLoss ? broker.longTermGainLoss.toString() : ''}
                    onChange={(e) => handleBrokerChange(idx, 'longTermGainLoss', parseFloat(e.target.value) || 0)}
                  />

                  <AppInput
                    label="Total 1099-B Gross Proceeds ($)"
                    type="number"
                    placeholder="e.g. 65000"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={broker.totalProceeds ? broker.totalProceeds.toString() : ''}
                    onChange={(e) => handleBrokerChange(idx, 'totalProceeds', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Direct Summary: Capital Gains & Prior Year Loss Carryforward */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div>
          <h5 className="text-xs font-semibold text-gray-700 tracking-tight flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct Summary: Capital Gains &amp; Prior Year Loss Carryforward</span>
          </h5>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Provide annual aggregate capital gains and prior year carryforward losses
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Primary Taxpayer */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-gray-700 block border-b border-slate-200 pb-1">
              Primary Taxpayer
            </span>

            <AppInput
              label={`Taxpayer: Capital Gain in ${selectedTaxYear} ($)`}
              type="number"
              placeholder="e.g. 4200"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={d.capitalGainTaxpayer !== undefined && d.capitalGainTaxpayer !== null && d.capitalGainTaxpayer > 0 ? d.capitalGainTaxpayer.toString() : (d.capitalGain2025 ? d.capitalGain2025.toString() : '')}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                updateField('capitalGainTaxpayer', val);
                updateField('capitalGain2025', val);
                updateField('totalCapitalGain', val);
              }}
            />

            <AppInput
              label={`Taxpayer: Capital (Loss) in ${selectedTaxYear} ($)`}
              type="number"
              placeholder="e.g. 1500"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={d.capitalLossTaxpayer !== undefined && d.capitalLossTaxpayer !== null && d.capitalLossTaxpayer > 0 ? d.capitalLossTaxpayer.toString() : (d.capitalLoss2025 ? d.capitalLoss2025.toString() : '')}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                updateField('capitalLossTaxpayer', val);
                updateField('capitalLoss2025', val);
              }}
            />

            <AppInput
              label={`Taxpayer: Capital Loss Carryforward from ${selectedTaxYear - 2} & ${selectedTaxYear - 1} ($)`}
              type="number"
              placeholder="e.g. 3000"
              leftIcon={<DollarSign className="w-4 h-4" />}
              error={errors.lossCarryforwardTaxpayer}
              value={d.lossCarryforwardTaxpayer !== undefined && d.lossCarryforwardTaxpayer !== null && d.lossCarryforwardTaxpayer > 0 ? d.lossCarryforwardTaxpayer.toString() : (d.capitalLossCarryforward2023_2024 ? d.capitalLossCarryforward2023_2024.toString() : '')}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                updateField('lossCarryforwardTaxpayer', val);
                updateField('capitalLossCarryforward2023_2024', val);
                if (clearError) clearError('lossCarryforwardTaxpayer');
              }}
            />
          </div>

          {/* Spouse (Joint Filer) */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-gray-700 block border-b border-slate-200 pb-1">
              Spouse (Joint Filer)
            </span>

            <AppInput
              label={`Spouse: Capital Gain in ${selectedTaxYear} ($)`}
              type="number"
              placeholder="e.g. 800"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={d.capitalGainSpouse !== undefined && d.capitalGainSpouse !== null && d.capitalGainSpouse > 0 ? d.capitalGainSpouse.toString() : ''}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                updateField('capitalGainSpouse', val);
              }}
            />

            <AppInput
              label={`Spouse: Capital (Loss) in ${selectedTaxYear} ($)`}
              type="number"
              placeholder="0"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={d.capitalLossSpouse !== undefined && d.capitalLossSpouse !== null && d.capitalLossSpouse > 0 ? d.capitalLossSpouse.toString() : ''}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                updateField('capitalLossSpouse', val);
              }}
            />

            <AppInput
              label={`Spouse: Capital Loss Carryforward from ${selectedTaxYear - 2} & ${selectedTaxYear - 1} ($)`}
              type="number"
              placeholder="0"
              leftIcon={<DollarSign className="w-4 h-4" />}
              error={errors.lossCarryforwardSpouse}
              value={d.lossCarryforwardSpouse !== undefined && d.lossCarryforwardSpouse !== null && d.lossCarryforwardSpouse > 0 ? d.lossCarryforwardSpouse.toString() : ''}
              onChange={(e) => {
                const val = Math.max(0, parseFloat(e.target.value) || 0);
                updateField('lossCarryforwardSpouse', val);
                if (clearError) clearError('lossCarryforwardSpouse');
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. ESPP / RSU / Crypto Notice */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-gray-700 block">Employer Stock &amp; Crypto Dispositions (ESPP / RSU / Form 3921 / Form 3922):</span>
        <p className="text-[11px] text-slate-500">
          If you exercised incentive stock options or sold vested RSUs with disqualifying dispositions, upload Form 3921 / Form 3922 into Documents for cost-basis adjustment.
        </p>
        <AppInput
          label="Additional Details on Stock / Crypto Dispositions"
          placeholder="e.g. Sold 150 RSUs via Morgan Stanley at $142 vesting price; Bitcoin transactions via Coinbase"
          error={errors.esppRsuDetails}
          value={d.esppRsuDetails || ''}
          onChange={(e) => {
            updateField('esppRsuDetails', e.target.value);
            if (clearError) clearError('esppRsuDetails');
          }}
        />
      </div>
    </div>
  );
};
