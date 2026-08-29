/**
 * IRS Modernized e-File (MeF) Authorized ERO Configuration
 * Sourced dynamically from environment variables (.env)
 */
export const irsConfig = {
  efin: process.env.IRS_ERO_EFIN || '582910',
  etin: process.env.IRS_ERO_ETIN || '9281',
  firmName: process.env.IRS_ERO_FIRM_NAME || 'TaxCRM Professional Tax Services LLC',
  ein: process.env.IRS_ERO_EIN || '12-3456789',
  gatewayEnv: (process.env.IRS_GATEWAY_ENV as 'PRODUCTION' | 'TEST') || 'PRODUCTION',
};
