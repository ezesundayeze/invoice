export interface CurrencyOption {
  code: string;
  name: string;
}

export const DEFAULT_CURRENCY = 'USD';

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AED', name: 'UAE Dirham' },
];

export const formatCurrency = (
  amount: number,
  currency: string = DEFAULT_CURRENCY
): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const getCurrencySymbol = (
  currency: string = DEFAULT_CURRENCY
): string => {
  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).formatToParts(0);
    return parts.find((part) => part.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
};

export interface CurrencySettings {
  // Currency the dashboard totals are converted to and displayed in, and the
  // currency new invoices default to.
  defaultCurrency: string;
  // USD value of 1 unit of each currency (USD-anchored, so USD is always 1).
  // e.g. rates.EUR = 1.08 means 1 EUR = 1.08 USD.
  rates: Record<string, number>;
}

const SETTINGS_KEY = 'invoice-currency-settings';

// Sensible starting rates (USD value of 1 unit). The user can update these in
// Settings whenever they need to.
export const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  CAD: 0.73,
  AUD: 0.66,
  CHF: 1.12,
  CNY: 0.14,
  INR: 0.012,
  NGN: 0.00067,
  ZAR: 0.054,
  BRL: 0.18,
  MXN: 0.058,
  SGD: 0.74,
  AED: 0.27,
};

export const getCurrencySettings = (): CurrencySettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      defaultCurrency: parsed.defaultCurrency || DEFAULT_CURRENCY,
      rates: { ...DEFAULT_RATES, ...(parsed.rates || {}) },
    };
  } catch {
    return { defaultCurrency: DEFAULT_CURRENCY, rates: { ...DEFAULT_RATES } };
  }
};

export const saveCurrencySettings = (settings: CurrencySettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors (e.g. private mode).
  }
};

// Convert an amount from one currency to another using USD-anchored rates.
export const convertCurrency = (
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number => {
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  if (!toRate) return amount;
  return (amount * fromRate) / toRate;
};
