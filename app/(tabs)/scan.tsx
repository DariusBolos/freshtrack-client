import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Layout, Spinner, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useScanReceipt } from '@/hooks/useScan';

type ParsedProduct = {
  id: string;
  name: string;
};

const extractProducts = (payload: unknown): ParsedProduct[] => {
  const source =
    (payload as { products?: unknown[]; items?: unknown[]; foodProducts?: unknown[] })?.products ??
    (payload as { products?: unknown[]; items?: unknown[]; foodProducts?: unknown[] })?.items ??
    (payload as { products?: unknown[]; items?: unknown[]; foodProducts?: unknown[] })?.foodProducts ??
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => {
      if (typeof item === 'string') {
        return { id: `${index}-${item}`, name: item };
      }

      if (item && typeof item === 'object') {
        const candidate = item as {
          id?: string;
          name?: string;
          productName?: string;
          label?: string;
          title?: string;
        };

        const name = candidate.name ?? candidate.productName ?? candidate.label ?? candidate.title;
        if (name) {
          return {
            id: candidate.id ?? `${index}-${name}`,
            name,
          };
        }
      }

      return null;
    })
    .filter((product): product is ParsedProduct => product !== null);
};

const ScanTab = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const scanMutation = useScanReceipt();

  const hasResults = products.length > 0;

  const emptyStateMessage = useMemo(() => {
    if (scanMutation.isPending) return t('scan.uploading');
    if (scanError) return scanError;
    if (imageUri) return t('scan.ready_to_scan');
    return t('scan.take_photo_hint');
  }, [scanMutation.isPending, scanError, imageUri, t]);

  const handleCapturePhoto = async () => {
    setScanError(null);

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('scan.permission_title'), t('scan.permission_message'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.9,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    setImageUri(result.assets[0].uri);
    setProducts([]);
  };

  const handleGetFoodProducts = () => {
    if (!imageUri || scanMutation.isPending) return;

    setScanError(null);

    scanMutation.mutate(imageUri, {
      onSuccess: (data) => {
        const parsed = extractProducts(data);
        setProducts(parsed);
        if (parsed.length === 0) {
          setScanError(t('scan.no_products_found'));
        }
      },
      onError: (error: unknown) => {
        if (isAxiosError(error)) {
          const backendMessage = typeof error.response?.data?.message === 'string' ? error.response.data.message : null;

          if (backendMessage) {
            setScanError(backendMessage);
            return;
          }

          if (!error.response) {
            setScanError(t('scan.network_error'));
            return;
          }
        }

        setScanError(t('scan.upload_failed'));
      },
    });
  };

  return (
    <Layout style={[styles.screen, { backgroundColor: theme['background-basic-color-1'] }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <FontAwesome5 name="camera" size={22} color={theme['color-primary-500']} />
          <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]}>{t('scan.title')}</Text>
        </View>

        <Card style={[styles.previewCard, { backgroundColor: theme['background-basic-color-2'] }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <FontAwesome5 name="camera-retro" size={32} color={theme['text-hint-color']} />
              <Text style={[styles.placeholderText, { color: theme['text-hint-color'] }]}>{t('scan.take_photo_hint')}</Text>
            </View>
          )}
        </Card>

        {/*TODO: change button color to match current buttons*/}

        <View style={styles.actions}>
          <Button onPress={handleCapturePhoto} status="success" appearance={imageUri ? 'outline' : 'filled'} style={styles.actionButton}>
            {imageUri ? t('scan.retake_photo') : t('scan.open_camera')}
          </Button>
          <Button
            onPress={handleGetFoodProducts}
            status="success"
            disabled={!imageUri || scanMutation.isPending}
            style={styles.actionButton}
          >
            {t('scan.get_food_products')}
          </Button>
        </View>

        <View style={styles.statusBlock}>
          {scanMutation.isPending ? (
            <View style={styles.loadingRow}>
              <Spinner size="small" />
              <Text style={{ color: theme['text-basic-color'] }}>{t('scan.uploading')}</Text>
            </View>
          ) : null}
          {emptyStateMessage ? (
            <Text status={scanError ? 'danger' : 'basic'} style={styles.statusText}>
              {emptyStateMessage}
            </Text>
          ) : null}
        </View>

        {hasResults ? (
          <View style={styles.resultsBlock}>
            <Text category="s1" style={{ color: theme['text-basic-color'] }}>
              {t('scan.results_title')}
            </Text>
            {products.map((product) => (
              <Pressable
                key={product.id}
                style={[
                  styles.resultRow,
                  {
                    backgroundColor: theme['background-basic-color-2'],
                    borderColor: theme['background-basic-color-3'],
                  },
                ]}
              >
                <FontAwesome5 name="apple-alt" size={14} color={theme['color-primary-500']} />
                <Text style={[styles.resultText, { color: theme['text-basic-color'] }]}>{product.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
  },
  placeholder: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 15,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 12,
  },
  statusBlock: {
    minHeight: 28,
    gap: 8,
  },
  statusText: {
    textAlign: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resultsBlock: {
    gap: 10,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  resultText: {
    flex: 1,
    fontSize: 15,
  },
});

export default ScanTab;
