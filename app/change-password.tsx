import { useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Layout, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';
import { useChangePassword } from '@/hooks/useChangePassword';
import Spinner from '@/components/Spinner';

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const ChangePasswordScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, isPending } = useChangePassword();

  const validateFields = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('auth.validation_required_fields'));
      return false;
    }

    if (newPassword !== confirmPassword) {
      setFormError(t('auth.error_password_mismatch'));
      return false;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      Alert.alert(t('auth.validation_password'));
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateFields()) {
      return;
    }

    setFormError(null);

    mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          Alert.alert(t('auth.password_updated_title'), t('auth.password_updated_message'), [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.save'), onPress: () => router.back() },
          ]);
        },
        onError: (err: unknown) => {
          if (isAxiosError(err)) {
            const backendMessage = typeof err.response?.data?.message === 'string' ? err.response.data.message : null;

            if (backendMessage) {
              setFormError(backendMessage);
              return;
            }

            if (!err.response) {
              setFormError(t('auth.error_network'));
              return;
            }

            if (err.response.status === 401) {
              setFormError(t('auth.error_invalid_credentials'));
              return;
            }
          }

          setFormError(t('auth.error_password_update'));
        },
      },
    );
  };

  const renderToggle = (secure: boolean, onToggle: () => void) => (
    <Pressable onPress={onToggle} style={styles.eyeButton}>
      <FontAwesome5 name={secure ? 'eye' : 'eye-slash'} size={18} color={theme['text-hint-color']} />
    </Pressable>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme['background-basic-color-1'] }]}>
        <Layout style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <FontAwesome5 name="chevron-left" size={16} color={theme['text-basic-color']} />
          </Pressable>
          <Text category="h6" style={styles.headerTitle}>
            {t('settings.change_password')}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <FontAwesome5 name="lock" size={16} color={theme['color-primary-500']} />
              </View>
              <View>
                <Text category="s1" style={styles.cardTitle}>
                  {t('settings.change_password')}
                </Text>
                <Text style={styles.cardSubtitle}>{t('auth.password_helper')}</Text>
              </View>
            </View>
            <Input
              placeholder={t('auth.current_password')}
              value={currentPassword}
              onChangeText={(value) => {
                setCurrentPassword(value);
                if (formError) setFormError(null);
              }}
              secureTextEntry={secureCurrent}
              accessoryRight={() => renderToggle(secureCurrent, () => setSecureCurrent((prev) => !prev))}
              style={styles.input}
            />
            <Input
              placeholder={t('auth.new_password')}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                if (formError) setFormError(null);
              }}
              secureTextEntry={secureNew}
              accessoryRight={() => renderToggle(secureNew, () => setSecureNew((prev) => !prev))}
              style={styles.input}
            />
            <Input
              placeholder={t('auth.confirm_new_password')}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (formError) setFormError(null);
              }}
              secureTextEntry={secureConfirm}
              accessoryRight={() => renderToggle(secureConfirm, () => setSecureConfirm((prev) => !prev))}
              style={styles.input}
            />

            {formError ? (
              <Text status="danger" style={styles.errorText}>
                {formError}
              </Text>
            ) : null}

            <Button onPress={handleSubmit} disabled={isPending} style={styles.submitButton}>
              {t('auth.update_password')}
            </Button>
          </View>
        </View>

        {isPending ? (
          <View style={styles.loadingOverlay}>
            <Spinner size="large" label={t('auth.loading')} />
          </View>
        ) : null}
        </Layout>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme['background-basic-color-1'],
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
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
      flex: 1,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: theme['background-basic-color-2'],
      borderRadius: 16,
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 14,
    },
    cardIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme['color-primary-500'] + '18',
    },
    cardTitle: {
      color: theme['text-basic-color'],
      fontWeight: '700',
    },
    cardSubtitle: {
      color: theme['text-hint-color'],
      fontSize: 13,
      marginTop: 2,
    },
    input: {
      marginBottom: 12,
    },
    eyeButton: {
      paddingHorizontal: 6,
    },
    submitButton: {
      marginTop: 4,
    },
    errorText: {
      textAlign: 'center',
      marginBottom: 8,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme['background-basic-color-1'] + 'CC',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
  });

export default ChangePasswordScreen;

