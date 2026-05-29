import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { FoodProduct } from '@/types/productTypes';
import { getDaysUntilExpiry, getExpiryStatus, getExpiryColors, ExpiryStatus } from '@/utils/productUtils';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';

type Props = {
  products: FoodProduct[];
  onPress?: () => void;
  ctaLabel?: string;
};

const STATUS_ORDER: ExpiryStatus[] = ['expired', 'critical', 'warning', 'good', 'fresh'];

const ExpiryChart: React.FC<Props> = ({ products, onPress, ctaLabel }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { resolvedTheme } = useSettings();

  const buckets = useMemo(() => {
    const counts: Record<ExpiryStatus, number> = {
      expired: 0,
      critical: 0,
      warning: 0,
      good: 0,
      fresh: 0,
    };
    products.forEach((p) => {
      const days = getDaysUntilExpiry(p.expiryDate);
      counts[getExpiryStatus(days)]++;
    });
    return STATUS_ORDER.map((status) => ({
      status,
      count: counts[status],
      colors: getExpiryColors(status, resolvedTheme),
    }));
  }, [products, resolvedTheme]);

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  const chartWidth = 300;
  const chartHeight = 140;
  const barWidth = 36;
  const barGap = (chartWidth - barWidth * buckets.length) / (buckets.length + 1);
  const topPadding = 22;
  const bottomPadding = 20;
  const drawableHeight = chartHeight - topPadding - bottomPadding;

  const statusLabels: Record<ExpiryStatus, string> = {
    expired: t('home.chart_expired'),
    critical: t('home.chart_critical'),
    warning: t('home.chart_warning'),
    good: t('home.chart_good'),
    fresh: t('home.chart_fresh'),
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container style={[styles.container, { backgroundColor: theme['background-basic-color-2'] }]} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme['text-basic-color'] }]}>{t('home.expiry_overview')}</Text>
        {onPress && ctaLabel ? (
          <Text style={[styles.ctaText, { color: theme['color-primary-500'] }]}>{ctaLabel}</Text>
        ) : null}
      </View>
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          {buckets.map((bucket, i) => {
            const x = barGap + i * (barWidth + barGap);
            const barHeight = maxCount > 0 ? (bucket.count / maxCount) * drawableHeight : 0;
            const y = topPadding + drawableHeight - barHeight;

            return (
              <React.Fragment key={bucket.status}>
                <Rect x={x} y={y} width={barWidth} height={barHeight} rx={6} ry={6} fill={bucket.colors.border} opacity={0.85} />
                <SvgText x={x + barWidth / 2} y={y - 6} fontSize={12} fontWeight="700" fill={bucket.colors.badge} textAnchor="middle">
                  {bucket.count}
                </SvgText>
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 4}
                  fontSize={9}
                  fontWeight="600"
                  fill={theme['text-hint-color']}
                  textAnchor="middle"
                >
                  {statusLabels[bucket.status]}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartWrapper: {
    alignItems: 'center',
  },
});

export default ExpiryChart;
