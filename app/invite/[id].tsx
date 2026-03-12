import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MOCK_NOTIFICATIONS } from '@/data/mockDashboard';

const InviteDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id && n.type === 'family_invite');
  const [responded, setResponded] = useState<'accepted' | 'declined' | null>(null);

  if (!notification) {
    return (
      <View style={[styles.center, { backgroundColor: theme['background-basic-color-1'] }]}>
        <FontAwesome5 name="exclamation-triangle" size={48} color={theme['text-disabled-color']} />
        <Text style={[styles.notFoundText, { color: theme['text-hint-color'] }]}>{t('invite.not_found')}</Text>
      </View>
    );
  }

  const initials = (notification.inviterName ?? '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleAccept = () => {
    setResponded('accepted');
    // TODO: call API to accept invite
  };

  const handleDecline = () => {
    Alert.alert(t('invite.decline_confirm_title'), t('invite.decline_confirm_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('invite.decline'),
        style: 'destructive',
        onPress: () => {
          setResponded('declined');
          // TODO: call API to decline invite
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <View style={[styles.header, { backgroundColor: theme['background-basic-color-2'] }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <FontAwesome5 name="arrow-left" size={18} color={theme['text-basic-color']} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]}>{t('invite.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme['background-basic-color-2'] }]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#64B5F6' + '18' }]}>
            <FontAwesome5 name="user-friends" size={32} color="#64B5F6" />
          </View>

          <Text style={[styles.familyName, { color: theme['text-basic-color'] }]}>{notification.familyName}</Text>

          <Text style={[styles.subtitle, { color: theme['text-hint-color'] }]}>{t('invite.subtitle')}</Text>

          <View style={[styles.divider, { backgroundColor: theme['text-hint-color'] + '15' }]} />

          <View style={styles.inviterRow}>
            <View style={[styles.avatar, { backgroundColor: '#64B5F6' + '22' }]}>
              <Text style={[styles.avatarText, { color: '#64B5F6' }]}>{initials}</Text>
            </View>
            <View style={styles.inviterInfo}>
              <Text style={[styles.inviterLabel, { color: theme['text-hint-color'] }]}>{t('invite.invited_by')}</Text>
              <Text style={[styles.inviterName, { color: theme['text-basic-color'] }]}>{notification.inviterName}</Text>
              <Text style={[styles.inviterEmail, { color: theme['text-hint-color'] }]}>{notification.inviterEmail}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme['text-hint-color'] + '15' }]} />

          <View style={styles.permissionsSection}>
            <Text style={[styles.permissionsTitle, { color: theme['text-basic-color'] }]}>{t('invite.what_you_can_do')}</Text>
            <PermissionRow icon="eye" text={t('invite.perm_view')} theme={theme} />
            <PermissionRow icon="plus-circle" text={t('invite.perm_add')} theme={theme} />
            <PermissionRow icon="edit" text={t('invite.perm_edit')} theme={theme} />
          </View>
        </View>

        {responded ? (
          <View style={[styles.responseCard, { backgroundColor: responded === 'accepted' ? '#4CAF50' + '15' : '#F44336' + '15' }]}>
            <FontAwesome5
              name={responded === 'accepted' ? 'check-circle' : 'times-circle'}
              size={20}
              color={responded === 'accepted' ? '#4CAF50' : '#F44336'}
            />
            <Text style={[styles.responseText, { color: responded === 'accepted' ? '#4CAF50' : '#F44336' }]}>
              {responded === 'accepted' ? t('invite.accepted_message') : t('invite.declined_message')}
            </Text>
          </View>
        ) : (
          <View style={styles.actions}>
            <Pressable
              onPress={handleDecline}
              style={({ pressed }) => [styles.declineButton, { borderColor: theme['text-hint-color'] + '40', opacity: pressed ? 0.7 : 1 }]}
            >
              <FontAwesome5 name="times" size={14} color={theme['text-hint-color']} />
              <Text style={[styles.declineText, { color: theme['text-hint-color'] }]}>{t('invite.decline')}</Text>
            </Pressable>
            <Pressable
              onPress={handleAccept}
              style={({ pressed }) => [styles.acceptButton, { backgroundColor: theme['color-primary-500'], opacity: pressed ? 0.85 : 1 }]}
            >
              <FontAwesome5 name="check" size={14} color="#FFFFFF" />
              <Text style={styles.acceptText}>{t('invite.accept')}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

type PermissionRowProps = {
  icon: string;
  text: string;
  theme: Record<string, string>;
};

const PermissionRow = ({ icon, text, theme }: PermissionRowProps) => (
  <View style={styles.permRow}>
    <FontAwesome5 name={icon} size={13} color={theme['color-primary-500']} style={styles.permIcon} />
    <Text style={[styles.permText, { color: theme['text-basic-color'] }]}>{text}</Text>
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
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  familyName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  divider: {
    height: 1,
    alignSelf: 'stretch',
    marginVertical: 18,
  },

  inviterRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
  },
  inviterInfo: {
    flex: 1,
  },
  inviterLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  inviterName: {
    fontSize: 15,
    fontWeight: '700',
  },
  inviterEmail: {
    fontSize: 12,
    marginTop: 1,
  },

  permissionsSection: {
    alignSelf: 'stretch',
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permIcon: {
    width: 24,
    textAlign: 'center',
  },
  permText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  declineText: {
    fontSize: 15,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  responseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  responseText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default InviteDetail;
