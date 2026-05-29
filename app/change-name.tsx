import { useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Input, Layout, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { isAxiosError } from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '@/hooks/useSettings';
import { useUpdateUser } from '@/hooks/useUserMutations';
import Spinner from '@/components/Spinner';

const ChangeNameScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettings();

  const [firstName, setFirstName] = useState(settings.firstName);
  const [lastName, setLastName] = useState(settings.lastName);
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, isPending } = useUpdateUser();

  const validateFields = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t('auth.validation_required_fields'));
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateFields()) {
      return;
    }

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    setFormError(null);

    mutate(
      { firstName: trimmedFirst, lastName: trimmedLast },
      {
        onSuccess: () => {
          settings.updateSetting('firstName', trimmedFirst);
          settings.updateSetting('lastName', trimmedLast);
          router.back();
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
          }

          setFormError(t('settings.name_update_failed'));
        },
      },
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme['background-basic-color-1'] }]}>
        <Layout style={styles.screen}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <FontAwesome5 name="chevron-left" size={16} color={theme['text-basic-color']} />
            </Pressable>
            <Text category="h6" style={styles.headerTitle}>
              {t('settings.edit_name')}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <FontAwesome5 name="user" size={16} color={theme['color-primary-500']} />
                </View>
                <View>
                  <Text category="s1" style={styles.cardTitle}>
                    {t('settings.edit_name')}
                  </Text>
                  <Text style={styles.cardSubtitle}>{t('settings.name_helper')}</Text>
                </View>
              </View>
              <Input
                placeholder={t('auth.firstname')}
                value={firstName}
                onChangeText={(value) => {
                  setFirstName(value);
                  if (formError) setFormError(null);
                }}
                style={styles.input}
              />
              <Input
                placeholder={t('auth.lastname')}
                value={lastName}
                onChangeText={(value) => {
                  setLastName(value);
                  if (formError) setFormError(null);
                }}
                style={styles.input}
              />

              {formError ? (
                <Text status="danger" style={styles.errorText}>
                  {formError}
                </Text>
              ) : null}

              <Button onPress={handleSubmit} disabled={isPending} style={styles.submitButton}>
                {t('common.save')}
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

export default ChangeNameScreen;

