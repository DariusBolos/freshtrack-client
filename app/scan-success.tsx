import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Layout, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

const AUTO_REDIRECT_MS = 1600;

const ScanSuccessScreen = () => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ count?: string }>();

  const savedCount = useMemo(() => {
    const parsed = Number(params.count);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [params.count]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/home');
    }, AUTO_REDIRECT_MS);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <Layout style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <View style={[styles.card, { backgroundColor: theme['background-basic-color-2'] }]}>
        <View style={[styles.iconWrap, { backgroundColor: theme['color-success-500'] + '18' }]}>
          <FontAwesome5 name="check" size={28} color={theme['color-success-500']} />
        </View>

        <Text category="h5" style={[styles.title, { color: theme['text-basic-color'] }]}>
          {t('scan.success_title')}
        </Text>
        <Text style={[styles.message, { color: theme['text-hint-color'] }]}>
          {t('scan.success_message', { count: savedCount })}
        </Text>

        <Button
          status="success"
          onPress={() => router.replace('/home')}
          style={styles.button}
        >
          {t('scan.go_home')}
        </Button>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '800',
  },
  message: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },
  button: {
    alignSelf: 'stretch',
  },
});

export default ScanSuccessScreen;

