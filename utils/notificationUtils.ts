import { FoodProduct } from '@/types/productTypes';
import { CreateNotificationPayload, Notification } from '@/types/dashboardTypes';
import { getDaysUntilExpiry } from '@/utils/productUtils';

export type ExpiryPayload = {
  /** Used to deduplicate: "<productId>:<type>" */
  key: string;
  payload: CreateNotificationPayload;
};

/**
 * Builds notification payloads for products that are expired or expiring soon.
 *
 * The caller is responsible for filtering out payloads whose `key` already
 * exists in the server-returned notification list (match on productId + type).
 */
export const buildExpiryPayloads = (
  products: FoodProduct[],
  reminderDaysBefore: number,
): ExpiryPayload[] => {
  const results: ExpiryPayload[] = [];

  for (const product of products) {
    const daysLeft = getDaysUntilExpiry(product.expiryDate);

    if (daysLeft < 0) {
      results.push({
        key: `${product.id}:expired`,
        payload: {
          type: 'expired',
          title: 'Product Expired',
          message: `${product.name} expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago. Consider removing it from your inventory.`,
          timestamp: product.expiryDate,
          read: false,
          productId: product.id,
          productName: product.name,
        },
      });
    } else if (daysLeft === 0) {
      results.push({
        key: `${product.id}:expiring_soon`,
        payload: {
          type: 'expiring_soon',
          title: 'Expires Today',
          message: `${product.name} expires today! Use it before it goes to waste.`,
          timestamp: new Date().toISOString(),
          read: false,
          productId: product.id,
          productName: product.name,
        },
      });
    } else if (daysLeft <= reminderDaysBefore) {
      results.push({
        key: `${product.id}:expiring_soon`,
        payload: {
          type: 'expiring_soon',
          title: 'Expiring Soon',
          message: `${product.name} expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Use it before it goes to waste!`,
          timestamp: new Date().toISOString(),
          read: false,
          productId: product.id,
          productName: product.name,
        },
      });
    }
  }

  return results;
};

/**
 * Returns a Set of dedup keys (`"<productId>:<type>"`) that already exist
 * in the server notification list so we never POST duplicates.
 */
export const existingExpiryKeys = (notifications: Notification[]): Set<string> => {
  const keys = new Set<string>();
  for (const n of notifications) {
    if (n.productId && (n.type === 'expired' || n.type === 'expiring_soon')) {
      keys.add(`${n.productId}:${n.type}`);
    }
  }
  return keys;
};

