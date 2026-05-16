import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Modal, Text, useTheme } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

type ActionType = 'remove' | 'leave';

type Props = {
  visible: boolean;
  type: ActionType | null;
  memberName: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
};

const HouseholdMemberActionModal = ({ visible, type, memberName, onConfirm, onClose, isLoading }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!type) return null;

  const title = type === 'remove' ? t('home.kick_confirm_title') : t('home.leave_confirm_title');
  const message =
    type === 'remove' ? t('home.kick_confirm_message', { name: memberName }) : t('home.leave_confirm_message');
  const confirmLabel = type === 'remove' ? t('home.kick_confirm_action') : t('home.leave_confirm_action');

  return (
    <Modal visible={visible} onBackdropPress={onClose} backdropStyle={styles.backdrop} style={styles.modal}>
      <Card disabled style={[styles.card, { backgroundColor: theme['background-basic-color-1'] }]}>
        <Text style={[styles.title, { color: theme['text-basic-color'] }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme['text-hint-color'] }]}>{message}</Text>
        <View style={styles.actions}>
          <Button appearance="ghost" onPress={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button status="danger" onPress={onConfirm} disabled={isLoading}>
            {confirmLabel}
          </Button>
        </View>
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
    maxWidth: 420,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 14,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
});

export default HouseholdMemberActionModal;

