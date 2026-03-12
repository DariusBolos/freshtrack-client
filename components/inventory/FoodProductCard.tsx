import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Animated, PanResponder, Platform, UIManager } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FoodProduct } from '@/types/productTypes';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryColors } from '@/utils/productUtils';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  product: FoodProduct;
  onDelete?: (id: string) => void;
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
const DELETE_WIDTH = 72;
const SWIPE_THRESHOLD = 40;

const FoodProductCard: React.FC<Props> = ({ product, onDelete }) => {
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

  const translateX = useRef(new Animated.Value(0)).current;
  const rowHeight = useRef(new Animated.Value(1)).current;
  const rowOpacity = useRef(new Animated.Value(1)).current;
  const isOpen = useRef(false);
  const removing = useRef(false);
  const measuredHeight = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => !removing.current && Math.abs(gesture.dx) > 10 && Math.abs(gesture.dy) < 20,
      onPanResponderMove: (_, gesture) => {
        const base = isOpen.current ? -DELETE_WIDTH : 0;
        const next = Math.min(0, Math.max(-DELETE_WIDTH, base + gesture.dx));
        translateX.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const base = isOpen.current ? -DELETE_WIDTH : 0;
        const final = base + gesture.dx;
        if (final < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -DELETE_WIDTH,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
          isOpen.current = true;
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
          isOpen.current = false;
        }
      },
    }),
  ).current;

  const handleDelete = () => {
    if (removing.current) return;
    removing.current = true;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -500,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rowOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      Animated.timing(rowHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        onDelete?.(product.id);
      });
    });
  };

  const animatedMaxHeight = rowHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, measuredHeight.current || 500],
  });

  return (
    <Animated.View
      style={[
        styles.outerWrapper,
        {
          opacity: rowOpacity,
          maxHeight: measuredHeight.current > 0 ? animatedMaxHeight : undefined,
        },
      ]}
      onLayout={(e) => {
        if (measuredHeight.current === 0) {
          measuredHeight.current = e.nativeEvent.layout.height;
        }
      }}
    >
      <View style={styles.wrapper}>
        <View style={[styles.deleteContainer, { backgroundColor: '#D32F2F' }]}>
          <Pressable onPress={handleDelete} style={styles.deleteButton} hitSlop={8}>
            <FontAwesome5 name="times" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
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
              <View style={[styles.footer, { borderTopColor: theme['text-hint-color'] + '20' }]}>
                <FontAwesome5 name="calendar-alt" size={11} color={theme['text-hint-color']} />
                <Text style={[styles.footerText, { color: theme['text-hint-color'] }]}>
                  {t('inventory.expires_on')}: {formattedDate}
                </Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    overflow: 'hidden',
  },
  wrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  deleteContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: DELETE_WIDTH,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
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
