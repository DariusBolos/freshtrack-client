import { useState } from 'react';
import { useTheme, Layout, Input, Button, Text } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useLogin } from '@/hooks/auth';
import { TouchableOpacity, StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';

const LoginForm = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const { t } = useTranslation();
  const { mutate, isPending } = useLogin();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const validateFields = () => {
    if (!email || !password) {
      alert(t('auth.validation_required_fields'));
      return false;
    }

    return true;
  };

  const handleLogin = () => {
    if (!validateFields()) {
      return;
    }

    setAuthError(null);

    mutate(
      { email, password },
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
              return;
            }

            if (!err.response) {
              setAuthError(t('auth.error_network'));
              return;
            }

            if (err.response.status === 401) {
              setAuthError(t('auth.error_invalid_credentials'));
              return;
            }
          }

          setAuthError(t('auth.error_login_failed'));
        },
      },
    );
  };

  const handleNavigationToRegister = () => {
    router.push('/register');
    router.navigate('/register');
  };

  const renderEmailIcon = () => <FontAwesome5 name="user" size={20} color="gray" solid />;

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
            {t('auth.sign_into_account')}
          </Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
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
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>{t('auth.forgot_password')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            {authError ? (
              <Text status="danger" style={styles.errorText}>
                {authError}
              </Text>
            ) : null}
            <Button style={styles.loginButton} onPress={handleLogin} disabled={isPending}>
              {t('auth.login')}
            </Button>
            <TouchableOpacity onPress={handleNavigationToRegister}>
              <Text style={styles.notAccountText}>{t('auth.dont_have_account')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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

    forgotPassword: {
      alignSelf: 'flex-end',
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

    loginButton: {
      height: 60,
      backgroundColor: theme['color-primary-500'],
      color: theme['color-basic-100'],
    },

    notAccountText: {
      textAlign: 'center',
    },

    footer: {
      marginBottom: 20,
      gap: 25,
    },

    errorText: {
      textAlign: 'center',
    },
  });

export default LoginForm;
