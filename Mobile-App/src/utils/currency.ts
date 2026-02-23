import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const CURRENCIES: { [key: string]: Currency } = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
};

// Get the preferred currency code
export const getPreferredCurrency = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem('preferred_currency');
    return saved || 'INR';
  } catch (error) {
    console.error('Error getting currency:', error);
    return 'INR';
  }
};

// Get currency symbol
export const getCurrencySymbol = (code: string = 'INR'): string => {
  return CURRENCIES[code]?.symbol || '₹';
};

// Format amount with currency
export const formatCurrency = async (amount: number, code?: string): Promise<string> => {
  try {
    const currency = code || (await getPreferredCurrency());
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

// Format amount synchronously (for components that need it immediately)
export const formatCurrencySync = (amount: number, currencyCode: string = 'INR'): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toLocaleString('en-IN')}`;
};

// Get currency info
export const getCurrencyInfo = (code: string = 'INR'): Currency => {
  return CURRENCIES[code] || CURRENCIES.INR;
};

// Set preferred currency
export const setPreferredCurrency = async (code: string): Promise<void> => {
  try {
    if (CURRENCIES[code]) {
      await AsyncStorage.setItem('preferred_currency', code);
    } else {
      throw new Error(`Invalid currency code: ${code}`);
    }
  } catch (error) {
    console.error('Error setting currency:', error);
  }
};

export default CURRENCIES;
