import React from 'react';
import { DollarSign } from 'lucide-react';
import { AppInput } from '@/shared/components/AppInput';
import { type OrganizerData } from '../../../services/customer-api';

interface BusinessMarketingSectionProps {
  data: Partial<OrganizerData['b3_businessExpenses']>;
  onChange: <K extends keyof NonNullable<OrganizerData['b3_businessExpenses']>>(
    field: K,
    val: NonNullable<OrganizerData['b3_businessExpenses']>[K]
  ) => void;
}

export const BusinessMarketingSection: React.FC<BusinessMarketingSectionProps> = ({
  data = {},
  onChange,
}) => {
  const updateAmount = (field: keyof NonNullable<OrganizerData['b3_businessExpenses']>, val: string) => {
    const raw = parseFloat(val);
    onChange(field, (isNaN(raw) ? 0 : raw) as any);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AppInput
          label="Advertising, Marketing &amp; Seeking Business ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.advertisingMarketing !== undefined && data.advertisingMarketing !== 0 ? data.advertisingMarketing.toString() : ''}
          onChange={(e) => updateAmount('advertisingMarketing', e.target.value)}
          helperText="If any expenses occurred for advertising, publicity, or marketing your company."
        />

        <AppInput
          label="Business Travel &amp; Transportation ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.travelAirfare !== undefined && data.travelAirfare !== 0 ? data.travelAirfare.toString() : ''}
          onChange={(e) => updateAmount('travelAirfare', e.target.value)}
          helperText="If there are any travel or transportation expenses for company business."
        />

        <AppInput
          label="Lodging, Hotels &amp; Accommodations ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.lodgingHotels !== undefined && data.lodgingHotels !== 0 ? data.lodgingHotels.toString() : ''}
          onChange={(e) => updateAmount('lodgingHotels', e.target.value)}
          helperText="Hotel accommodations directly related to business travel trips."
        />

        <AppInput
          label="Meal and Entertainment Expenses ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.businessMeals50 !== undefined && data.businessMeals50 !== 0 ? data.businessMeals50.toString() : ''}
          onChange={(e) => updateAmount('businessMeals50', e.target.value)}
          helperText="If there are any food/services expenses occurred for employer/employee regarding business purpose (IRS 50% limit)."
        />

        <AppInput
          label="Employee Training &amp; Continuing Education ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.educationConferences !== undefined && data.educationConferences !== 0 ? data.educationConferences.toString() : ''}
          onChange={(e) => updateAmount('educationConferences', e.target.value)}
          helperText="Employee training, certifications, and educational workshops."
        />

        <AppInput
          label="Employee Welfare Expenses ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.employeeWelfare !== undefined && data.employeeWelfare !== 0 ? data.employeeWelfare.toString() : ''}
          onChange={(e) => updateAmount('employeeWelfare', e.target.value)}
          helperText="Employee welfare, wellness, and office refreshments/amenities."
        />

        <AppInput
          label="Meetings with Colleagues ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.meetingExpenses !== undefined && data.meetingExpenses !== 0 ? data.meetingExpenses.toString() : ''}
          onChange={(e) => updateAmount('meetingExpenses', e.target.value)}
          helperText="If there are any expenses incurred in meeting with company employees regarding business purpose."
        />

        <AppInput
          label="Per Diem Expenses Paid to Employees ($)"
          type="number"
          placeholder="0.00"
          leftIcon={<DollarSign className="w-3.5 h-3.5" />}
          value={data.perDiemExpenses !== undefined && data.perDiemExpenses !== 0 ? data.perDiemExpenses.toString() : ''}
          onChange={(e) => updateAmount('perDiemExpenses', e.target.value)}
          helperText="Standard daily lodging/meal allowances paid to employees on travel."
        />
      </div>
    </div>
  );
};
