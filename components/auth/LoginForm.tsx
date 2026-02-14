import { useState } from 'react';
import { useTheme, Layout, Input, Button, Text } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const LoginForm = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const { t } = useTranslation();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleLogin = () => {
    setTimeout(() => {
      console.log('Login attempt:', { email, password });
    }, 1500);
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
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessoryRight={renderEmailIcon}
              style={styles.input}
            />
            <Input
              placeholder={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              accessoryRight={renderPasswordIcon}
              style={styles.input}
            />
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>{t('auth.forgot_password')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Button style={styles.loginButton} onPress={handleLogin} disabled={!email || !password}>
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
  });

export default LoginForm;
