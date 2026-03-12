import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { useProducts } from '@/hooks/useProducts';
import { MOCK_STATS, MOCK_RECIPES, MOCK_FAMILY, MOCK_NOTIFICATIONS } from '@/data/mockDashboard';
import StatCard from '@/components/home/StatCard';
import ExpiryChart from '@/components/home/ExpiryChart';
import RecipeCard from '@/components/home/RecipeCard';
import FamilyMemberRow from '@/components/home/FamilyMemberRow';
import NotificationsModal from '@/components/home/NotificationsModal';
import Spinner from '@/components/Spinner';

const HomeTab = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { firstName } = useSettings();

  const { data: products, isLoading } = useProducts();

  const [notifVisible, setNotifVisible] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  //TODO update spinner component
  if (isLoading) {
    return <Spinner size="medium" />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <View style={styles.greetingLeft}>
            <Text style={[styles.greetingHello, { color: theme['text-hint-color'] }]}>{t('home.hello')}</Text>
            <View style={styles.nameRow}>
              <Text style={[styles.greetingName, { color: theme['text-basic-color'] }]}>{firstName}</Text>
              <View style={[styles.leafIcon, { backgroundColor: theme['color-primary-500'] + '18' }]}>
                <FontAwesome5 name="leaf" size={14} color={theme['color-primary-500']} />
              </View>
            </View>
          </View>
          <Pressable
            onPress={() => setNotifVisible(true)}
            style={[styles.bellButton, { backgroundColor: theme['background-basic-color-2'] }]}
            hitSlop={8}
          >
            <FontAwesome5 name="bell" size={18} color={theme['text-basic-color']} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme['color-danger-500'] }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('home.your_impact')}</Text>
        <View style={styles.statsRow}>
          <StatCard icon="apple-alt" label={t('home.food_saved')} value={String(MOCK_STATS.foodSaved)} color={theme['color-primary-500']} />
          <StatCard
            icon="weight"
            label={t('home.waste_avoided')}
            value={`${MOCK_STATS.wasteAvoided} kg`}
            color={theme['color-accent-500']}
          />
          <StatCard icon="receipt" label={t('home.receipts_scanned')} value={String(MOCK_STATS.receiptsScanned)} color="#64B5F6" />
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="boxes" label={t('home.total_products')} value={String(MOCK_STATS.totalProducts)} />
          <StatCard icon="exclamation-triangle" label={t('home.expiring_today')} value={String(MOCK_STATS.expiringToday)} color="#F44336" />
          <StatCard icon="clock" label={t('home.expiring_soon')} value={String(MOCK_STATS.expiringSoon)} color="#FFA000" />
        </View>

        <View style={styles.sectionSpacing}>
          <ExpiryChart products={products!} />
        </View>

        <View style={styles.sectionSpacing}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('home.recipe_suggestions')}</Text>
            <Pressable hitSlop={8}>
              <Text style={[styles.seeAll, { color: theme['color-primary-500'] }]}>{t('home.see_all')}</Text>
            </Pressable>
          </View>
          {MOCK_RECIPES.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </View>

        <View style={styles.sectionSpacing}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('home.family_mode')}</Text>
            <Pressable hitSlop={8} style={[styles.inviteButton, { backgroundColor: theme['color-primary-500'] }]}>
              <FontAwesome5 name="user-plus" size={11} color="#FFFFFF" />
              <Text style={styles.inviteText}>{t('home.invite')}</Text>
            </Pressable>
          </View>
          <Text style={[styles.familyHint, { color: theme['text-hint-color'] }]}>{t('home.family_hint')}</Text>
          <View style={[styles.familyCard, { backgroundColor: theme['background-basic-color-2'] }]}>
            {MOCK_FAMILY.map((member, i) => (
              <FamilyMemberRow key={member.id} member={member} isLast={i === MOCK_FAMILY.length - 1} />
            ))}
          </View>
        </View>
      </ScrollView>
      <NotificationsModal
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  greeting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingHello: {
    fontSize: 14,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  greetingName: {
    fontSize: 26,
    fontWeight: '800',
  },
  leafIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sectionSpacing: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  familyHint: {
    fontSize: 13,
    marginBottom: 10,
  },
  familyCard: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inviteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default HomeTab;
