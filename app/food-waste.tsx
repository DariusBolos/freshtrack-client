import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Layout, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const FoodWasteScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme['background-basic-color-1'] }]}>
      <Layout style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome5 name="chevron-left" size={16} color={theme['text-basic-color']} />
          </Pressable>
          <Text category="h6" style={styles.headerTitle}>
            {t('food_waste.title')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <FontAwesome5 name="leaf" size={18} color={theme['color-primary-500']} />
            </View>
            <Text category="h5" style={styles.heroTitle}>
              {t('food_waste.hero_title')}
            </Text>
            <Text style={styles.heroText}>{t('food_waste.hero_text')}</Text>
          </View>

          <View style={styles.factGrid}>
            <View style={styles.factCard}>
              <Text style={styles.factValue}>{t('food_waste.fact_1_value')}</Text>
              <Text style={styles.factLabel}>{t('food_waste.fact_1_label')}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factValue}>{t('food_waste.fact_2_value')}</Text>
              <Text style={styles.factLabel}>{t('food_waste.fact_2_label')}</Text>
            </View>
          </View>

          <View style={styles.factGrid}>
            <View style={styles.factCard}>
              <Text style={styles.factValue}>{t('food_waste.fact_3_value')}</Text>
              <Text style={styles.factLabel}>{t('food_waste.fact_3_label')}</Text>
            </View>
            <View style={styles.factCard}>
              <Text style={styles.factValue}>{t('food_waste.fact_4_value')}</Text>
              <Text style={styles.factLabel}>{t('food_waste.fact_4_label')}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text category="s1" style={styles.sectionTitle}>
              {t('food_waste.why_title')}
            </Text>
            <Text style={styles.sectionText}>{t('food_waste.why_text')}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text category="s1" style={styles.sectionTitle}>
              {t('food_waste.household_title')}
            </Text>
            <Text style={styles.sectionText}>{t('food_waste.household_text')}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text category="s1" style={styles.sectionTitle}>
              {t('food_waste.how_title')}
            </Text>
            <Text style={styles.sectionText}>{t('food_waste.how_text')}</Text>
          </View>

          <View style={styles.sectionCard}>
            <Text category="s1" style={styles.sectionTitle}>
              {t('food_waste.tips_title')}
            </Text>
            <View style={styles.tipList}>
              <Text style={styles.tipItem}>{t('food_waste.tip_1')}</Text>
              <Text style={styles.tipItem}>{t('food_waste.tip_2')}</Text>
              <Text style={styles.tipItem}>{t('food_waste.tip_3')}</Text>
              <Text style={styles.tipItem}>{t('food_waste.tip_4')}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text category="s1" style={styles.sectionTitle}>
              {t('food_waste.app_title')}
            </Text>
            <Text style={styles.sectionText}>{t('food_waste.app_text')}</Text>
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
      gap: 12,
    },
    heroCard: {
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 18,
      padding: 16,
      alignItems: 'flex-start',
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
    sectionCard: {
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 16,
      padding: 14,
    },
    factGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    factCard: {
      flex: 1,
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 16,
      padding: 14,
    },
    factValue: {
      color: theme['color-primary-500'],
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 4,
    },
    factLabel: {
      color: theme['text-hint-color'],
      fontSize: 12,
      lineHeight: 16,
    },
    sectionTitle: {
      color: theme['text-basic-color'],
      fontWeight: '700',
      marginBottom: 6,
    },
    sectionText: {
      color: theme['text-hint-color'],
      fontSize: 14,
      lineHeight: 20,
    },
    tipList: {
      gap: 8,
    },
    tipItem: {
      color: theme['text-hint-color'],
      fontSize: 14,
      lineHeight: 20,
    },
  });

export default FoodWasteScreen;

