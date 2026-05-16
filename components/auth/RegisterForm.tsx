import { useState } from 'react';
import { useTheme, Layout, Input, Button, Text } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useRegister } from '@/hooks/auth';
import { Alert, TouchableOpacity, StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import Spinner from '@/components/Spinner';

const RegisterForm = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const { t } = useTranslation();
  const { mutate, isPending } = useRegister();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const validateFields = () => {
    if (!email || !password || !firstName || !lastName) {
      alert(t('auth.validation_required_fields'));
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert(t('auth.validation_email'));
      return false;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
      alert(t('auth.validation_password'));
      return false;
    }

    return true;
  };

  const handleRegister = () => {
    if (!validateFields()) {
      return;
    }

    setAuthError(null);

    mutate(
      { firstName, lastName, email, password },
      {
        onSuccess: async (response) => {
          setAuthError(null);
          await AsyncStorage.setItem('token', response.data.token);
          router.push('/home');
        },
        onError: (err: unknown) => {
          if (isAxiosError(err)) {
            const backendMessage =
              typeof err.response?.data?.message === 'string' ? err.response.data.message : null;

            if (backendMessage) {
              setAuthError(backendMessage);
              Alert.alert(t('auth.register_error_title'), backendMessage);
              return;
            }

            if (!err.response) {
              const message = t('auth.error_network');
              setAuthError(message);
              Alert.alert(t('auth.register_error_title'), message);
              return;
            }

            if (err.response.status === 409) {
              const message = t('auth.error_email_in_use');
              setAuthError(message);
              Alert.alert(t('auth.register_error_title'), message);
              return;
            }
          }

          const message = t('auth.error_register_failed');
          setAuthError(message);
          Alert.alert(t('auth.register_error_title'), message);
        },
      },
    );
  };

  const renderEmailIcon = () => <FontAwesome5 name="envelope" size={20} color="gray" solid />;

  const renderPasswordIcon = () => (
    <TouchableOpacity onPress={toggleSecureEntry}>
      <FontAwesome5 name={secureTextEntry ? 'eye' : 'eye-slash'} size={20} color="gray" solid />
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Layout style={styles.container}>
        <View style={styles.header}>
          <Text category="h1" style={styles.title}>
            FreshTrack
          </Text>
          <Text category="h2" style={styles.subTitle}>
            {t('auth.create_account')}
          </Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Input
              placeholder={t('auth.firstname')}
              value={firstName}
              onChangeText={(value) => {
                setFirstName(value);
                if (authError) setAuthError(null);
              }}
              keyboardType="default"
              autoCapitalize="none"
              style={styles.input}
            />
            <Input
              placeholder={t('auth.lastname')}
              value={lastName}
              onChangeText={(value) => {
                setLastName(value);
                if (authError) setAuthError(null);
              }}
              keyboardType="default"
              autoCapitalize="none"
              style={styles.input}
            />
            <Input
              placeholder={t('auth.email')}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (authError) setAuthError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              accessoryRight={renderEmailIcon}
              style={styles.input}
            />
            <Input
              placeholder={t('auth.password')}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (authError) setAuthError(null);
              }}
              secureTextEntry={secureTextEntry}
              accessoryRight={renderPasswordIcon}
              style={styles.input}
            />
          </View>
          <View style={styles.footer}>
            {authError ? (
              <Text status="danger" style={styles.errorText}>
                {authError}
              </Text>
            ) : null}
            <Button style={styles.registerButton} onPress={handleRegister} disabled={isPending}>
              {t('auth.register')}
            </Button>
          </View>
        </View>
        {isPending ? (
          <View style={styles.loadingOverlay}>
            <Spinner size="large" label={t('auth.loading')} />
          </View>
        ) : null}
      </Layout>
    </TouchableWithoutFeedback>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
    },

    header: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme['color-primary-500'],
    },

    title: {
      textAlign: 'center',
      marginBottom: 32,
    },

    subTitle: {
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 'light',
    },

    inputContainer: {
      flex: 1,
      maxHeight: 200,
    },

    formContainer: {
      flex: 3,
      padding: 20,
      justifyContent: 'space-between',
      marginTop: 10,
    },

    input: {
      marginBottom: 20,
    },

    registerButton: {
      height: 60,
      backgroundColor: theme['color-primary-500'],
      color: theme['color-basic-100'],
    },

    footer: {
      marginBottom: 20,
      gap: 25,
    },

    errorText: {
      textAlign: 'center',
    },

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme['background-basic-color-1'] + 'CC',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
  });

export default RegisterForm;
