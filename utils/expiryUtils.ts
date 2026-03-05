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
 */
export const getExpiryColors = (status: ExpiryStatus) => {
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
