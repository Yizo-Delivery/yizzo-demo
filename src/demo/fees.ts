import type { Currency, Fees } from './types';

// The backend's defaults: PLATFORM_FEE_PERCENT=10, TAX_RATE=8
export const FEE_PERCENT = 10;
export const TAX_PERCENT = 8;

/** Cents for dollars, whole birr for birr */
const round = (amount: number, currency: Currency) =>
  currency === 'USD' ? Math.round(amount * 100) / 100 : Math.round(amount);

/** Each part rounded on its own; the total is the sum of the rounded parts */
export function computeFees(reward: number, currency: Currency): Fees {
  const fee = round((reward * FEE_PERCENT) / 100, currency);
  const tax = round(((reward + fee) * TAX_PERCENT) / 100, currency);
  return { reward, fee, tax, total: round(reward + fee + tax, currency) };
}

export function formatMoney(amount: number, currency: Currency): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${Math.round(amount).toLocaleString('en-US')} ETB`;
}
