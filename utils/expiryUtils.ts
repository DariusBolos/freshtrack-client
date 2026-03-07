export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'good' | 'fresh';

/**
 * Returns the number of days until a product expires.
 * Negative values mean the product has already expired.
 */
export const getDaysUntilExpiry = (expiryDate: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Maps days remaining to an expiry status.
 */
export const getExpiryStatus = (daysLeft: number): ExpiryStatus => {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 1) return 'critical';
  if (daysLeft <= 3) return 'warning';
  if (daysLeft <= 7) return 'good';
  return 'fresh';
};

/**
 * Returns themed colors for a given expiry status.
 * Each set has a card background, an accent border color, and a badge text color.
 * Pass 'light' or 'dark' to get palette-appropriate values.
 */
export const getExpiryColors = (status: ExpiryStatus, mode: 'light' | 'dark' = 'dark') => {
  if (mode === 'light') {
    switch (status) {
      case 'expired':
        return { bg: '#FFEBEE', border: '#D32F2F', badge: '#B71C1C' };
      case 'critical':
        return { bg: '#FBE9E7', border: '#F44336', badge: '#BF360C' };
      case 'warning':
        return { bg: '#FFF8E1', border: '#FFA000', badge: '#E65100' };
      case 'good':
        return { bg: '#F1F8E9', border: '#7CB342', badge: '#33691E' };
      case 'fresh':
        return { bg: '#E8F5E9', border: '#4CAF50', badge: '#1B5E20' };
    }
  }

  switch (status) {
    case 'expired':
      return { bg: '#3B1A1A', border: '#D32F2F', badge: '#EF9A9A' };
    case 'critical':
      return { bg: '#3B2A1A', border: '#F44336', badge: '#FFAB91' };
    case 'warning':
      return { bg: '#3B341A', border: '#FFA000', badge: '#FFE082' };
    case 'good':
      return { bg: '#253B1A', border: '#7CB342', badge: '#C5E1A5' };
    case 'fresh':
      return { bg: '#1A3B2A', border: '#4CAF50', badge: '#A5D6A7' };
  }
};
