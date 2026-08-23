import React from 'react';
import { Sparkles, DollarSign, Plus, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface Module6Props {
  data: OrganizerData['m6_stocks'];
  updateField: <K extends keyof OrganizerData['m6_stocks']>(field: K, value: OrganizerData['m6_stocks'][K]) => void;
  selectedTaxYear: number;
}

export const Module6Stocks: React.FC<Module6Props> = ({
  data,
  updateField,
  selectedTaxYear,
}) => {
  const stockList = data.stocksList || [];

  return (
    <div className="space-y-6">
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>1099-B Brokerage, ESPP/RSU &amp; Capital Loss Carryforwards:</strong> The IRS matches 1099-B proceeds directly against broker records. Report all trading accounts (Robinhood, Fidelity, E*TRADE, Zerodha, Charles Schwab), employer stock forms (Form 3921 &amp; 3922), and separate gains/losses for Taxpayer and Spouse.
        </div>
      </div>

      {/* Dynamic Multi-Brokerage Accounts Table */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Brokerage Accounts &amp; 1099-B Statements</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Add each brokerage platform traded during {selectedTaxYear}</p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
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
              updateField('tradedStocks', true);
            }}
            className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Brokerage Platform</span>
          </Button>
        </div>

        {stockList.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 space-y-2">
            <p>No individual brokerage platforms added yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                updateField('stocksList', [{
                  brokerName: data.brokerName || 'Robinhood Financial LLC',
                  taxpayerGainLoss: data.capitalGain2025 || data.totalCapitalGain || 0,
                  spouseGainLoss: 0,
                  shortTermGainLoss: 0,
                  longTermGainLoss: 0,
                  totalProceeds: 0,
                }]);
                updateField('tradedStocks', true);
              }}
              className="text-xs font-bold border-emerald-200 text-[#16A34A] bg-emerald-50 hover:bg-emerald-100"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Brokerage Platform</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {stockList.map((stk, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-bold text-slate-800">Brokerage Platform #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const list = stockList.filter((_, i) => i !== idx);
                      updateField('stocksList', list);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <AppInput
                    label="Broker / Institution Name *"
                    placeholder="e.g. Robinhood / Fidelity / Zerodha"
                    value={stk.brokerName}
                    onChange={(e) => {
                      const list = [...stockList];
                      list[idx].brokerName = e.target.value;
                      updateField('stocksList', list);
                      if (idx === 0) updateField('brokerName', e.target.value);
                    }}
                  />

                  <AppInput
                    label="Taxpayer Gain / (Loss) ($) *"
                    type="number"
                    placeholder="e.g. 4200 or -1500"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={stk.taxpayerGainLoss ? stk.taxpayerGainLoss.toString() : ''}
                    onChange={(e) => {
                      const list = [...stockList];
                      list[idx].taxpayerGainLoss = parseFloat(e.target.value) || 0;
                      updateField('stocksList', list);
                    }}
                  />

                  <AppInput
                    label="Spouse Gain / (Loss) ($)"
                    type="number"
                    placeholder="e.g. 1200 or 0"
                    leftIcon={<DollarSign className="w-4 h-4" />}
                    value={stk.spouseGainLoss ? stk.spouseGainLoss.toString() : ''}
                    onChange={(e) => {
                      const list = [...stockList];
                      list[idx].spouseGainLoss = parseFloat(e.target.value) || 0;
                      updateField('stocksList', list);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aggregate Capital Gains, Losses & Carryforwards Table (Taxpayer vs Spouse) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Aggregate Capital Gains &amp; Prior Year Loss Carryforwards</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-3">
            <span className="text-xs font-bold text-emerald-900 block border-b border-emerald-200 pb-1">
              Primary Taxpayer
            </span>

            <AppInput
              label={`Taxpayer: Capital Gain in ${selectedTaxYear} ($)`}
              type="number"
              placeholder="e.g. 4200"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={data.capitalGainTaxpayer ? data.capitalGainTaxpayer.toString() : (data.capitalGain2025 ? data.capitalGain2025.toString() : '')}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
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
              value={data.capitalLossTaxpayer ? data.capitalLossTaxpayer.toString() : (data.capitalLoss2025 ? data.capitalLoss2025.toString() : '')}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateField('capitalLossTaxpayer', val);
                updateField('capitalLoss2025', val);
              }}
            />

            <AppInput
              label={`Taxpayer: Capital Loss Carryforward from ${selectedTaxYear - 2} & ${selectedTaxYear - 1} ($)`}
              type="number"
              placeholder="e.g. 3000"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={data.lossCarryforwardTaxpayer ? data.lossCarryforwardTaxpayer.toString() : (data.capitalLossCarryforward2023_2024 ? data.capitalLossCarryforward2023_2024.toString() : '')}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateField('lossCarryforwardTaxpayer', val);
                updateField('capitalLossCarryforward2023_2024', val);
              }}
            />
          </div>

          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
            <span className="text-xs font-bold text-indigo-900 block border-b border-indigo-200 pb-1">
              Spouse (Joint Filer)
            </span>

            <AppInput
              label={`Spouse: Capital Gain in ${selectedTaxYear} ($)`}
              type="number"
              placeholder="e.g. 800"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={data.capitalGainSpouse ? data.capitalGainSpouse.toString() : ''}
              onChange={(e) => updateField('capitalGainSpouse', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label={`Spouse: Capital (Loss) in ${selectedTaxYear} ($)`}
              type="number"
              placeholder="0"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={data.capitalLossSpouse ? data.capitalLossSpouse.toString() : ''}
              onChange={(e) => updateField('capitalLossSpouse', parseFloat(e.target.value) || 0)}
            />

            <AppInput
              label={`Spouse: Capital Loss Carryforward from ${selectedTaxYear - 2} & ${selectedTaxYear - 1} ($)`}
              type="number"
              placeholder="0"
              leftIcon={<DollarSign className="w-4 h-4" />}
              value={data.lossCarryforwardSpouse ? data.lossCarryforwardSpouse.toString() : ''}
              onChange={(e) => updateField('lossCarryforwardSpouse', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* ESPP / RSU / Crypto Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
        <span className="font-bold text-slate-800 block">Employer Stock Forms (ESPP / RSU / Form 3921 / Form 3922):</span>
        <p>
          If you exercised incentive stock options or sold vested RSUs with disqualifying dispositions, please upload Form 3921 / Form 3922 into the Document Vault for cost-basis adjustment to prevent double taxation on W-2 wages.
        </p>
        <AppInput
          label="Additional Details on Stock / Crypto Dispositions"
          placeholder="e.g. Sold 150 RSUs via Morgan Stanley at $142 vesting price; Bitcoin transactions via Coinbase"
          value={data.esppRsuDetails || ''}
          onChange={(e) => updateField('esppRsuDetails', e.target.value)}
        />
      </div>
    </div>
  );
};
