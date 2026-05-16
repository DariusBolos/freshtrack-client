import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Input, Modal, Text, useTheme } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';

type Props = {
  visible: boolean;
  email: string;
  onEmailChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
  isSending: boolean;
};

const FamilyInviteModal = ({ visible, email, onEmailChange, onClose, onSend, isSending }: Props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} onBackdropPress={onClose} backdropStyle={styles.backdrop} style={styles.modal}>
      <Card disabled style={[styles.card, { backgroundColor: theme['background-basic-color-1'] }]}>
        <Text style={[styles.title, { color: theme['text-basic-color'] }]}>{t('home.invite_title')}</Text>
        <Text style={[styles.subtitle, { color: theme['text-hint-color'] }]}>{t('home.invite_subtitle')}</Text>
        <Input
          label={t('home.invite_email_label')}
          placeholder={t('home.invite_email_placeholder')}
          value={email}
          onChangeText={onEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.actions}>
          <Button appearance="ghost" onPress={onClose} disabled={isSending}>
            {t('common.cancel')}
          </Button>
          <Button onPress={onSend} disabled={isSending}>
            {isSending ? t('home.invite_sending') : t('home.invite_send')}
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
    paddingVertical: 12,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
});

export default FamilyInviteModal;

