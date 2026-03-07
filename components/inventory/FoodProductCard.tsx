import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FoodProduct } from '@/types/productTypes';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryColors } from '@/utils/expiryUtils';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';

type Props = {
  product: FoodProduct;
};

const CATEGORY_ICONS: Record<string, string> = {
  dairy: 'cheese',
  meat: 'drumstick-bite',
  fruit: 'apple-alt',
  vegetable: 'carrot',
  bakery: 'bread-slice',
  beverage: 'glass-whiskey',
  frozen: 'snowflake',
  snack: 'cookie',
};
const DEFAULT_ICON = 'shopping-basket';

const FoodProductCard: React.FC<Props> = ({ product }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { resolvedTheme } = useSettings();

  const daysLeft = getDaysUntilExpiry(product.expiryDate);
  const status = getExpiryStatus(daysLeft);
  const colors = getExpiryColors(status, resolvedTheme);
  const icon = CATEGORY_ICONS[product.category?.toLowerCase() ?? ''] ?? DEFAULT_ICON;

  const expiryLabel =
    daysLeft < 0
      ? t('inventory.days_overdue', { count: Math.abs(daysLeft) })
      : daysLeft === 0
        ? t('inventory.expires_today')
        : t('inventory.days_left', { count: daysLeft });

  const formattedDate = new Date(product.expiryDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable onPress={() => router.push(`/product/${product.id}`)} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.bg,
            borderLeftColor: colors.border,
          },
        ]}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.border + '22' }]}>
            <FontAwesome5 name={icon} size={20} color={colors.border} />
          </View>

          <View style={styles.info}>
            <Text style={[styles.name, { color: theme['text-basic-color'] }]} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={[styles.qty, { color: theme['text-hint-color'] }]}>
              {product.quantity} {product.unit}
            </Text>
          </View>

          <View style={[styles.badge, { backgroundColor: colors.border + '1A', borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.badge }]}>{expiryLabel}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme['text-hint-color'] + '20' }]}>
          <FontAwesome5 name="calendar-alt" size={11} color={theme['text-hint-color']} />
          <Text style={[styles.footerText, { color: theme['text-hint-color'] }]}>
            {t('inventory.expires_on')}: {formattedDate}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  qty: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 12,
    marginLeft: 6,
  },
});

export default FoodProductCard;
