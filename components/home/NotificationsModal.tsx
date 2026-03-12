import React from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { Text, useTheme, Modal, Card } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Notification } from '@/types/dashboardTypes';

type Props = {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
};

const ICON_MAP: Record<Notification['type'], { name: string; color: string }> = {
  family_invite: { name: 'user-plus', color: '#64B5F6' },
  expiring_soon: { name: 'clock', color: '#FFA000' },
  expired: { name: 'exclamation-triangle', color: '#F44336' },
};

const formatTimestamp = (timestamp: string): string => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationsModal = ({ visible, onClose, notifications, onMarkAllRead }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationPress = (item: Notification) => {
    if (item.type === 'family_invite') {
      onClose();
      router.push(`/invite/${item.id}`);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = ICON_MAP[item.type];
    const isTappable = item.type === 'family_invite';

    const row = (
      <View
        style={[
          styles.notifRow,
          {
            backgroundColor: item.read ? 'transparent' : theme['color-primary-500'] + '0C',
            borderBottomColor: theme['border-basic-color-3'],
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: icon.color + '20' }]}>
          <FontAwesome5 name={icon.name} size={14} color={icon.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: theme['text-basic-color'] }]}>{item.title}</Text>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme['color-primary-500'] }]} />}
          </View>
          <Text style={[styles.notifMessage, { color: theme['text-hint-color'] }]}>{item.message}</Text>
          <View style={styles.notifFooter}>
            <Text style={[styles.notifTime, { color: theme['text-disabled-color'] }]}>{formatTimestamp(item.timestamp)}</Text>
            {isTappable && <Text style={[styles.tapHint, { color: theme['color-primary-500'] }]}>{t('invite.view_invite')}</Text>}
          </View>
        </View>
        {isTappable && <FontAwesome5 name="chevron-right" size={12} color={theme['text-disabled-color']} style={styles.chevron} />}
      </View>
    );

    if (isTappable) {
      return <Pressable onPress={() => handleNotificationPress(item)}>{row}</Pressable>;
    }

    return row;
  };

  return (
    <Modal visible={visible} onBackdropPress={onClose} backdropStyle={styles.backdrop} style={styles.modal}>
      <Card disabled style={[styles.card, { backgroundColor: theme['background-basic-color-1'] }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme['text-basic-color'] }]}>{t('notifications.title')}</Text>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <Pressable onPress={onMarkAllRead} hitSlop={8}>
                <Text style={[styles.markAll, { color: theme['color-primary-500'] }]}>{t('notifications.mark_all_read')}</Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} hitSlop={8}>
              <FontAwesome5 name="times" size={18} color={theme['text-hint-color']} />
            </Pressable>
          </View>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <FontAwesome5 name="bell-slash" size={36} color={theme['text-disabled-color']} />
            <Text style={[styles.emptyText, { color: theme['text-hint-color'] }]}>{t('notifications.empty')}</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}
      </Card>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '90%',
    maxWidth: 400,
  },
  card: {
    borderRadius: 16,
    maxHeight: 480,
    paddingVertical: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  markAll: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    maxHeight: 380,
  },
  notifRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  notifMessage: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 4,
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tapHint: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NotificationsModal;
