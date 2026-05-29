import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Layout, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useSettings } from '@/hooks/useSettings';
import Spinner from '@/components/Spinner';
import { getDaysUntilExpiry, getExpiryColors, getExpiryStatus, ExpiryStatus } from '@/utils/productUtils';

const STATUS_ORDER: ExpiryStatus[] = ['critical', 'warning', 'good', 'fresh', 'expired'];

const ExpiryDetailsScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const { data: products = [], isLoading } = useProducts();

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

  const totalCount = products.length;
  const expiringSoon = buckets.find((b) => b.status === 'critical')!.count + buckets.find((b) => b.status === 'warning')!.count;
  const expiredCount = buckets.find((b) => b.status === 'expired')!.count;

  const statusLabels: Record<ExpiryStatus, string> = {
    expired: t('home.chart_expired'),
    critical: t('home.chart_critical'),
    warning: t('home.chart_warning'),
    good: t('home.chart_good'),
    fresh: t('home.chart_fresh'),
  };

  if (isLoading) {
    return <Spinner size="medium" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme['background-basic-color-1'] }]}>
      <Layout style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome5 name="chevron-left" size={16} color={theme['text-basic-color']} />
          </Pressable>
          <Text category="h6" style={styles.headerTitle}>
            {t('expiry_details.title')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <FontAwesome5 name="chart-bar" size={18} color={theme['color-primary-500']} />
            </View>
            <Text category="h5" style={styles.heroTitle}>
              {t('expiry_details.hero_title')}
            </Text>
            <Text style={styles.heroText}>{t('expiry_details.hero_text')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: theme['color-primary-500'] }]}>{totalCount}</Text>
              <Text style={styles.summaryLabel}>{t('expiry_details.total_label')}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: theme['color-warning-500'] ?? theme['color-primary-500'] }]}>
                {expiringSoon}
              </Text>
              <Text style={styles.summaryLabel}>{t('expiry_details.soon_label')}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: theme['color-danger-500'] }]}>{expiredCount}</Text>
              <Text style={styles.summaryLabel}>{t('expiry_details.expired_label')}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>{t('expiry_details.section_title')}</Text>
          <View style={styles.statusGrid}>
            {buckets.map((bucket) => (
              <View
                key={bucket.status}
                style={[
                  styles.statusCard,
                  {
                    backgroundColor: bucket.colors.bg,
                    borderColor: bucket.colors.border,
                  },
                ]}
              >
                <Text style={[styles.statusValue, { color: bucket.colors.badge }]}>{bucket.count}</Text>
                <Text style={[styles.statusLabel, { color: bucket.colors.badge }]}>{statusLabels[bucket.status]}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    screen: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'],
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    backButton: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme['background-basic-color-2'],
    },
    headerTitle: {
      color: theme['text-basic-color'],
      fontWeight: '700',
    },
    content: {
      paddingBottom: 28,
      gap: 14,
    },
    heroCard: {
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 18,
      padding: 16,
    },
    heroIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      backgroundColor: theme['color-primary-500'] + '18',
    },
    heroTitle: {
      color: theme['text-basic-color'],
      fontWeight: '800',
      marginBottom: 6,
    },
    heroText: {
      color: theme['text-hint-color'],
      fontSize: 14,
      lineHeight: 20,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 10,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 14,
      padding: 12,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
    },
    summaryLabel: {
      color: theme['text-hint-color'],
      fontSize: 11,
      textAlign: 'center',
    },
    sectionTitle: {
      color: theme['text-hint-color'],
      textTransform: 'uppercase',
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    statusGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statusCard: {
      width: '47%',
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
    },
    statusValue: {
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 6,
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
  });

export default ExpiryDetailsScreen;

