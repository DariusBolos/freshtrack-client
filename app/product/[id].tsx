import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryColors } from '@/utils/productUtils';
import { useSettings } from '@/hooks/useSettings';
import { useProduct } from '@/hooks/useProducts';

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

const ProductDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { resolvedTheme } = useSettings();

  const { data: product } = useProduct(id!);

  if (!product) {
    return (
      <View style={[styles.center, { backgroundColor: theme['background-basic-color-1'] }]}>
        <FontAwesome5 name="exclamation-triangle" size={48} color={theme['text-disabled-color']} />
        <Text style={[styles.notFoundText, { color: theme['text-hint-color'] }]}>{t('product_detail.not_found')}</Text>
      </View>
    );
  }

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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <View style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <View style={[styles.header, { backgroundColor: theme['background-basic-color-2'] }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <FontAwesome5 name="arrow-left" size={18} color={theme['text-basic-color']} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]} numberOfLines={1}>
          {product.name}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.border + '22' }]}>
            <FontAwesome5 name={icon} size={40} color={colors.border} />
          </View>
          <Text style={[styles.productName, { color: theme['text-basic-color'] }]}>{product.name}</Text>
          {product.category && (
            <Text style={[styles.category, { color: theme['text-hint-color'] }]}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Text>
          )}
          <View style={[styles.statusBadge, { backgroundColor: colors.border + '1A', borderColor: colors.border }]}>
            <Text style={[styles.statusText, { color: colors.badge }]}>{expiryLabel}</Text>
          </View>
        </View>

        <View style={[styles.infoSection, { backgroundColor: theme['background-basic-color-2'] }]}>
          <InfoRow icon="balance-scale" label={t('product_detail.quantity')} value={`${product.quantity} ${product.unit}`} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme['text-hint-color'] + '15' }]} />
          <InfoRow icon="shopping-bag" label={t('product_detail.purchased')} value={formatDate(product.purchaseDate)} theme={theme} />
          <View style={[styles.divider, { backgroundColor: theme['text-hint-color'] + '15' }]} />
          <InfoRow
            icon="calendar-times"
            label={t('product_detail.expires')}
            value={formatDate(product.expiryDate)}
            theme={theme}
            valueColor={colors.badge}
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.recipeButton, { backgroundColor: theme['color-primary-500'], opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {}}
        >
          <FontAwesome5 name="utensils" size={18} color="#FFFFFF" />
          <Text style={styles.recipeButtonText}>{t('product_detail.generate_recipes')}</Text>
        </Pressable>

        <Text style={[styles.recipeHint, { color: theme['text-hint-color'] }]}>{t('product_detail.generate_recipes_hint')}</Text>
      </ScrollView>
    </View>
  );
};

type InfoRowProps = {
  icon: string;
  label: string;
  value: string;
  theme: Record<string, string>;
  valueColor?: string;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, theme, valueColor }) => (
  <View style={styles.infoRow}>
    <FontAwesome5 name={icon} size={16} color={theme['color-primary-500']} style={styles.infoIcon} />
    <View style={styles.infoText}>
      <Text style={[styles.infoLabel, { color: theme['text-hint-color'] }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor ?? theme['text-basic-color'] }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  notFoundText: {
    fontSize: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  heroCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  category: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBadge: {
    marginTop: 14,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },

  infoSection: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoIcon: {
    width: 28,
    textAlign: 'center',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 40,
  },

  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
  },
  recipeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  recipeHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ProductDetail;
