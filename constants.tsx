
import { QualityType } from './types';

export const RATES = {
  CIVIL: {
    [QualityType.BASIC]: 1600,
    [QualityType.STANDARD]: 1850,
    [QualityType.PREMIUM]: 2400,
  },
  PAINTING: {
    [QualityType.BASIC]: 18,
    [QualityType.STANDARD]: 28,
    [QualityType.PREMIUM]: 45,
  },
  FLOORING: {
    VITRIFIED: 120,
    MARBLE: 350,
    GRANITE: 280,
    WOODEN: 220,
  },
  ELECTRICAL: 180, // per sq ft approx
  PLUMBING: {
    TOILET: 25000,
    KITCHEN: 15000,
  },
  DOORS_WINDOWS: {
    DOOR: 12000,
    WINDOW: 8000,
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Converts a number to words in Indian Numbering System (Lakhs/Crores)
 */
export const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  const helper = (n: number): string => {
    let str = "";
    if (n === 0) return "";
    
    if (n < 20) {
      str = a[n];
    } else if (n < 100) {
      str = b[Math.floor(n / 10)] + a[n % 10];
    } else {
      str = a[Math.floor(n / 100)] + 'Hundred ' + helper(n % 100);
    }
    return str;
  };

  let res = '';
  let n = Math.floor(num);

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remainder = n;

  if (crore > 0) res += helper(crore) + 'Crore ';
  if (lakh > 0) res += helper(lakh) + 'Lakh ';
  if (thousand > 0) res += helper(thousand) + 'Thousand ';
  if (remainder > 0) res += helper(remainder);

  return res.trim().replace(/\s+/g, ' ') + ' Rupees Only';
};
