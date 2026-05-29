import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Card, Modal, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings, ThemeMode, Language } from '@/hooks/useSettings';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsRow from '@/components/settings/SettingsRow';
import { useDeleteAccount } from '@/hooks/useUserMutations';
import { queryClient } from '@/api/queryClient';

const THEME_OPTIONS: { value: ThemeMode; labelKey: string; icon: string }[] = [
  { value: 'light', labelKey: 'settings.theme_light', icon: 'sun' },
  { value: 'dark', labelKey: 'settings.theme_dark', icon: 'moon' },
  { value: 'system', labelKey: 'settings.theme_system', icon: 'laptop' },
];

const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ro', label: 'Română', flag: '🇷🇴' },
];

const REMINDER_OPTIONS = [1, 2, 3, 5, 7];

const SettingsTab = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettings();

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const { mutate: deleteAccount } = useDeleteAccount();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
    } finally {
      // Drop stale authenticated data before returning to auth screens.
      queryClient.clear();
      router.replace('/login');
    }
  };

  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: async () => {
        await AsyncStorage.removeItem('token');
        queryClient.clear();
        router.replace('/login');
      },
      onError: () => {
        Alert.alert(t('settings.delete_account_error_title'), t('settings.delete_account_error_message'));
      },
    });
  };

  const themeLabelKey = THEME_OPTIONS.find((o) => o.value === settings.themeMode)?.labelKey ?? '';
  const langLabel = LANGUAGE_OPTIONS.find((o) => o.value === settings.language)?.label ?? '';

  return (
    <View style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FontAwesome5 name="cog" size={22} color={theme['color-primary-500']} />
          <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]}>{t('settings.title')}</Text>
        </View>

        <SettingsSection title={t('settings.section_account')}>
          <SettingsRow
            icon="user"
            label={t('settings.name')}
            type="press"
            value={`${settings.firstName} ${settings.lastName}`}
            onPress={() => router.push('/change-name')}
          />
          <SettingsRow
            icon="lock"
            label={t('settings.change_password')}
            type="press"
            onPress={() => router.push('/change-password')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section_appearance')}>
          <SettingsRow
            icon="palette"
            label={t('settings.theme')}
            type="press"
            value={t(themeLabelKey)}
            onPress={() => setThemeModalVisible(true)}
          />
          <SettingsRow
            icon="globe"
            label={t('settings.language')}
            type="press"
            value={langLabel}
            onPress={() => setLangModalVisible(true)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section_notifications')}>
          <SettingsRow
            icon="bell"
            label={t('settings.expiry_reminders')}
            type="toggle"
            value={settings.expiryReminders}
            onValueChange={(v) => settings.updateSetting('expiryReminders', v)}
          />
          <SettingsRow
            icon="calendar-day"
            label={t('settings.reminder_days')}
            type="press"
            value={t('settings.days_before', { count: settings.reminderDaysBefore })}
            onPress={() => setReminderModalVisible(true)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section_camera')}>
          <SettingsRow
            icon="camera"
            label={t('settings.auto_scan')}
            type="toggle"
            value={settings.autoScan}
            onValueChange={(v) => settings.updateSetting('autoScan', v)}
          />
          <SettingsRow
            icon="history"
            label={t('settings.save_scan_history')}
            type="toggle"
            value={settings.saveScanHistory}
            onValueChange={(v) => settings.updateSetting('saveScanHistory', v)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.section_data')}>
          <SettingsRow
            icon="trash-alt"
            label={t('settings.clear_data')}
            type="press"
            onPress={() =>
              Alert.alert(t('settings.clear_data'), t('settings.clear_data_confirm'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.delete'), style: 'destructive', onPress: () => {} },
              ])
            }
          />
          <SettingsRow
            icon="user-slash"
            label={t('settings.delete_account')}
            type="press"
            onPress={() =>
              Alert.alert(t('settings.delete_account_confirm_title'), t('settings.delete_account_confirm_message'), [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('settings.delete_account_confirm_action'),
                  style: 'destructive',
                  onPress: handleDeleteAccount,
                },
              ])
            }
          />
          <SettingsRow
            icon="sign-out-alt"
            label={t('auth.logout')}
            type="press"
            onPress={() =>
              Alert.alert(t('auth.logout'), t('settings.logout_confirm'), [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('auth.logout'), style: 'destructive', onPress: handleLogout },
              ])
            }
            isLast
          />
        </SettingsSection>

        <Text style={[styles.versionText, { color: theme['text-disabled-color'] }]}>FreshTrack v1.0.0</Text>
      </ScrollView>

      <Modal visible={themeModalVisible} backdropStyle={styles.backdrop} onBackdropPress={() => setThemeModalVisible(false)}>
        <Card disabled style={[styles.modal, { backgroundColor: theme['background-basic-color-2'] }]}>
          <Text style={[styles.modalTitle, { color: theme['text-basic-color'] }]}>{t('settings.theme')}</Text>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                settings.updateSetting('themeMode', opt.value);
                setThemeModalVisible(false);
              }}
              style={[
                styles.optionRow,
                settings.themeMode === opt.value && {
                  backgroundColor: theme['color-primary-500'] + '18',
                },
              ]}
            >
              <FontAwesome5
                name={opt.icon}
                size={16}
                color={settings.themeMode === opt.value ? theme['color-primary-500'] : theme['text-hint-color']}
                style={styles.optionIcon}
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: settings.themeMode === opt.value ? theme['color-primary-500'] : theme['text-basic-color'],
                  },
                ]}
              >
                {t(opt.labelKey)}
              </Text>
              {settings.themeMode === opt.value && <FontAwesome5 name="check" size={14} color={theme['color-primary-500']} />}
            </Pressable>
          ))}
        </Card>
      </Modal>

      <Modal visible={langModalVisible} backdropStyle={styles.backdrop} onBackdropPress={() => setLangModalVisible(false)}>
        <Card disabled style={[styles.modal, { backgroundColor: theme['background-basic-color-2'] }]}>
          <Text style={[styles.modalTitle, { color: theme['text-basic-color'] }]}>{t('settings.language')}</Text>
          {LANGUAGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                settings.updateSetting('language', opt.value);
                setLangModalVisible(false);
              }}
              style={[
                styles.optionRow,
                settings.language === opt.value && {
                  backgroundColor: theme['color-primary-500'] + '18',
                },
              ]}
            >
              <Text style={styles.flag}>{opt.flag}</Text>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: settings.language === opt.value ? theme['color-primary-500'] : theme['text-basic-color'],
                  },
                ]}
              >
                {opt.label}
              </Text>
              {settings.language === opt.value && <FontAwesome5 name="check" size={14} color={theme['color-primary-500']} />}
            </Pressable>
          ))}
        </Card>
      </Modal>

      <Modal visible={reminderModalVisible} backdropStyle={styles.backdrop} onBackdropPress={() => setReminderModalVisible(false)}>
        <Card disabled style={[styles.modal, { backgroundColor: theme['background-basic-color-2'] }]}>
          <Text style={[styles.modalTitle, { color: theme['text-basic-color'] }]}>{t('settings.reminder_days')}</Text>
          {REMINDER_OPTIONS.map((days) => (
            <Pressable
              key={days}
              onPress={() => {
                settings.updateSetting('reminderDaysBefore', days);
                setReminderModalVisible(false);
              }}
              style={[
                styles.optionRow,
                settings.reminderDaysBefore === days && {
                  backgroundColor: theme['color-primary-500'] + '18',
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: settings.reminderDaysBefore === days ? theme['color-primary-500'] : theme['text-basic-color'],
                  },
                ]}
              >
                {t('settings.days_before', { count: days })}
              </Text>
              {settings.reminderDaysBefore === days && <FontAwesome5 name="check" size={14} color={theme['color-primary-500']} />}
            </Pressable>
          ))}
        </Card>
      </Modal>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },

  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modal: {
    borderRadius: 16,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  optionIcon: {
    width: 24,
    textAlign: 'center',
    marginRight: 10,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  flag: {
    fontSize: 20,
    marginRight: 10,
  },
});

export default SettingsTab;
