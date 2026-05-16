import React, { useState } from 'react';
import { Alert, View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSettings } from '@/hooks/useSettings';
import { useProducts } from '@/hooks/useProducts';
import { useStats } from '@/hooks/useStats';
import { useRecipeSuggestions, useRecipes } from '@/hooks/useRecipes';
import { useFamilyInvite, useHouseholdMembers, useLeaveHousehold, useRemoveHouseholdMember } from '@/hooks/useFamily';
import { useUserData } from '@/hooks/useUserData';
import StatCard from '@/components/home/StatCard';
import ExpiryChart from '@/components/home/ExpiryChart';
import RecipeCard from '@/components/home/RecipeCard';
import FamilyMemberRow from '@/components/home/FamilyMemberRow';
import NotificationsModal from '@/components/home/NotificationsModal';
import FamilyInviteModal from '@/components/home/FamilyInviteModal';
import Spinner from '@/components/Spinner';
import { useNotifications, useMarkNotifications, useDeleteNotification, useExpiryNotificationSync } from '@/hooks/useNotifications';
import { queryClient } from '@/api/queryClient';
import { Notification, Recipe } from '@/types/dashboardTypes';
import HouseholdMemberActionModal from '@/components/home/HouseholdMemberActionModal';

const HomeTab = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { firstName, reminderDaysBefore } = useSettings();

  const { data: products = [], isLoading: isProductListLoading } = useProducts();
  const { data: stats, isLoading: isStatsLoading } = useStats();
  const { data: notifications = [], isLoading: isNotificationListLoading } = useNotifications();
  const { data: recipes = [], isLoading: isRecipesLoading } = useRecipes();
  const { data: householdMembers = [], isLoading: isHouseholdLoading } = useHouseholdMembers();
  const { data: userData } = useUserData();
  const {
    mutateAsync: refreshRecipes,
    isPending: isRecipesRefreshing,
  } = useRecipeSuggestions();
  const { mutateAsync: sendInvite, isPending: isInviteSending } = useFamilyInvite();
  const { mutateAsync: removeMember, isPending: isRemovingMember } = useRemoveHouseholdMember();
  const { mutateAsync: leaveHousehold, isPending: isLeavingHousehold } = useLeaveHousehold();
  const { mutate: markNotifications } = useMarkNotifications();
  const { mutate: deleteNotification } = useDeleteNotification();

  useExpiryNotificationSync(products, notifications, reminderDaysBefore);

  const [notifVisible, setNotifVisible] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [memberActionVisible, setMemberActionVisible] = useState(false);
  const [memberAction, setMemberAction] = useState<{ id: string; name: string; type: 'remove' | 'leave' } | null>(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleDismiss = (id: string) => {
    deleteNotification(id);
  };

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    queryClient.setQueryData(['notifications'], (oldNotifications: Notification[] | undefined) => {
      if (!oldNotifications) return [];
      return oldNotifications.map((notification) => ({ ...notification, read: true }));
    });

    markNotifications(unreadIds);
  };

  const handleSendInvite = async () => {
    const email = inviteEmail.trim();

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t('home.invite_invalid_email'));
      return;
    }

    try {
      await sendInvite({ email });
      setInviteEmail('');
      setInviteVisible(false);
      Alert.alert(t('home.invite_success_title'), t('home.invite_success_message', { email }));
    } catch {
      Alert.alert(t('home.invite_error_title'), t('home.invite_error_message'));
    }
  };

  const buildMemberName = (first: string, last: string, email: string) => {
    const combined = `${first ?? ''} ${last ?? ''}`.trim();
    return combined || email;
  };

  const getInitials = (label: string) => {
    const parts = label.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return label.slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const familyMembers = householdMembers.map((member) => {
    const name = buildMemberName(member.firstName, member.lastName, member.email);
    return {
      id: String(member.id),
      name,
      email: member.email,
      avatar: getInitials(name),
      role: member.role ?? (userData?.id === member.id ? 'owner' : 'viewer'),
    } as const;
  });

  const currentMember = familyMembers.find((member) => userData?.id && member.id === String(userData.id));
  const currentRole = currentMember?.role ?? 'viewer';
  const isOwner = currentRole === 'owner';

  const statsSnapshot =
    stats ??
    ({
      totalProducts: 0,
      expiringToday: 0,
      expiringSoon: 0,
      foodSaved: 0,
      wasteAvoided: 0,
      receiptsScanned: 0,
    } as const);

  if (isProductListLoading || isNotificationListLoading || isStatsLoading || isRecipesLoading || isHouseholdLoading) {
    return <Spinner size="medium" />;
  }

  const recipeCards = suggestedRecipes.length > 0 ? suggestedRecipes : recipes;

  const handleMemberPress = (memberId: string, memberName: string, isSelf: boolean) => {
    if (isOwner && !isSelf) {
      setMemberAction({ id: memberId, name: memberName, type: 'remove' });
      setMemberActionVisible(true);
      return;
    }
    if (!isOwner && isSelf) {
      setMemberAction({ id: memberId, name: memberName, type: 'leave' });
      setMemberActionVisible(true);
    }
  };

  const handleMemberActionConfirm = async () => {
    if (!memberAction) return;
    try {
      if (memberAction.type === 'remove') {
        await removeMember(memberAction.id);
      } else {
        await leaveHousehold();
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
      queryClient.invalidateQueries({ queryKey: ['householdMembers'] });
      setMemberActionVisible(false);
      setMemberAction(null);
    } catch {
      Alert.alert(
        memberAction.type === 'remove' ? t('home.kick_error_title') : t('home.leave_error_title'),
        memberAction.type === 'remove' ? t('home.kick_error_message') : t('home.leave_error_message'),
      );
    }
  };

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
          <StatCard
            icon="apple-alt"
            label={t('home.food_saved')}
            value={String(statsSnapshot.foodSaved)}
            color={theme['color-primary-500']}
          />
          <StatCard
            icon="weight"
            label={t('home.waste_avoided')}
            value={`${statsSnapshot.wasteAvoided} kg`}
            color={theme['color-accent-500']}
          />
          <StatCard icon="receipt" label={t('home.receipts_scanned')} value={String(statsSnapshot.receiptsScanned)} color="#64B5F6" />
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="boxes" label={t('home.total_products')} value={String(statsSnapshot.totalProducts)} />
          <StatCard
            icon="exclamation-triangle"
            label={t('home.expiring_today')}
            value={String(statsSnapshot.expiringToday)}
            color="#F44336"
          />
          <StatCard icon="clock" label={t('home.expiring_soon')} value={String(statsSnapshot.expiringSoon)} color="#FFA000" />
        </View>

        <View style={styles.sectionSpacing}>
          <ExpiryChart products={products!} />
        </View>

        <View style={styles.sectionSpacing}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('home.recipe_suggestions')}</Text>
            <View style={styles.recipeActions}>
              <Pressable
                hitSlop={8}
                onPress={async () => {
                  const fresh = await refreshRecipes(3);
                  setSuggestedRecipes(fresh);
                  queryClient.setQueryData(['recipes'], fresh);
                }}
                disabled={isRecipesRefreshing}
              >
                <Text style={[styles.refreshText, { color: theme['color-primary-500'] }]}>
                  {isRecipesRefreshing ? t('home.refreshing') : t('home.refresh')}
                </Text>
              </Pressable>
              <Pressable hitSlop={8} onPress={() => router.push('/recipes')}>
                <Text style={[styles.seeAll, { color: theme['color-primary-500'] }]}>{t('home.see_all')}</Text>
              </Pressable>
            </View>
          </View>
          {recipeCards.map((recipe: Recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </View>

        <View style={styles.sectionSpacing}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme['color-primary-500'] }]}>{t('home.family_mode')}</Text>
            <Pressable
              hitSlop={8}
              style={[styles.inviteButton, { backgroundColor: theme['color-primary-500'] }]}
              onPress={() => setInviteVisible(true)}
            >
              <FontAwesome5 name="user-plus" size={11} color="#FFFFFF" />
              <Text style={styles.inviteText}>{t('home.invite')}</Text>
            </Pressable>
          </View>
          <Text style={[styles.familyHint, { color: theme['text-hint-color'] }]}>{t('home.family_hint')}</Text>
          <View style={[styles.familyCard, { backgroundColor: theme['background-basic-color-2'] }]}>
            {familyMembers.map((member, i) => (
              <FamilyMemberRow
                key={member.id}
                member={member}
                isLast={i === familyMembers.length - 1}
                onPress={() => handleMemberPress(member.id, member.name, member.id === String(userData?.id))}
                isDisabled={isRemovingMember || isLeavingHousehold}
              />
            ))}
          </View>
        </View>
      </ScrollView>
      <HouseholdMemberActionModal
        visible={memberActionVisible}
        type={memberAction?.type ?? null}
        memberName={memberAction?.name ?? ''}
        onConfirm={handleMemberActionConfirm}
        onClose={() => {
          if (isRemovingMember || isLeavingHousehold) return;
          setMemberActionVisible(false);
          setMemberAction(null);
        }}
        isLoading={isRemovingMember || isLeavingHousehold}
      />
      <FamilyInviteModal
        visible={inviteVisible}
        email={inviteEmail}
        onEmailChange={setInviteEmail}
        onClose={() => setInviteVisible(false)}
        onSend={handleSendInvite}
        isSending={isInviteSending}
      />
      <NotificationsModal
        visible={notifVisible}
        onClose={() => setNotifVisible(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onDismiss={handleDismiss}
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
  recipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '700',
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
