import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, Modal as RNModal, Platform } from 'react-native';
import { Button, Card, IndexPath, Input, Layout, Modal, Select, SelectItem, Spinner, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useScanReceipt } from '@/hooks/useScan';
import { useSettings } from '@/hooks/useSettings';
import { api } from '@/api/axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { queryClient } from '@/api/queryClient';

type ParsedProduct = {
  id: string;
  serverId?: number;
  name: string;
  quantity: string;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  category: string;
};

const CATEGORY_OPTIONS = [
  { label: 'Dairy', value: 'dairy' },
  { label: 'Meat', value: 'meat' },
  { label: 'Fruit', value: 'fruit' },
  { label: 'Vegetable', value: 'vegetable' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Beverage', value: 'beverage' },
  { label: 'Frozen', value: 'frozen' },
  { label: 'Other', value: 'other' },
];

const UNIT_OPTIONS = [
  { label: 'Item', value: 'item' },
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
  { label: 'ml', value: 'ml' },
  { label: 'l', value: 'l' },
  { label: 'Pack', value: 'pack' },
  { label: 'Box', value: 'box' },
  { label: 'Bag', value: 'bag' },
];

const EXPIRY_DAYS_BY_CATEGORY: Record<string, number> = {
  dairy: 7,
  meat: 3,
  fruit: 7,
  vegetable: 7,
  bakery: 5,
  beverage: 30,
  frozen: 90,
  other: 7,
};

const getOptionIndex = (value: string, options: { label: string; value: string }[]) => {
  const index = options.findIndex((option) => option.value === value);
  return new IndexPath(index >= 0 ? index : 0);
};

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getDefaultExpiryDate = (category: string, baseDate: Date) => {
  const days = EXPIRY_DAYS_BY_CATEGORY[category] ?? EXPIRY_DAYS_BY_CATEGORY.other;
  return toDateInput(addDays(baseDate, days));
};

const formatDateValue = (value: unknown) => (typeof value === 'string' ? value : '');

const extractProducts = (payload: unknown): ParsedProduct[] => {
  const source =
    (payload as { products?: unknown[]; items?: unknown[]; foodProducts?: unknown[] })?.products ??
    (payload as { products?: unknown[]; items?: unknown[]; foodProducts?: unknown[] })?.items ??
    (payload as { products?: unknown[]; items?: unknown[]; foodProducts?: unknown[] })?.foodProducts ??
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(source)) return [];

  return source
    .map((item, index) => {
      if (item && typeof item === 'object') {
        const candidate = item as {
          id?: number;
          name?: string;
          productName?: string;
          label?: string;
          title?: string;
          quantity?: number | string;
          unit?: string;
          purchaseDate?: string;
          expiryDate?: string;
          category?: string;
        };

        const name = candidate.name ?? candidate.productName ?? candidate.label ?? candidate.title;
        if (name) {
          return {
            id: `${candidate.id ?? index}-${name}`,
            serverId: candidate.id,
            name,
            quantity: candidate.quantity != null ? String(candidate.quantity) : '1',
            unit: candidate.unit ?? 'item',
            purchaseDate: formatDateValue(candidate.purchaseDate) ?? '',
            expiryDate: formatDateValue(candidate.expiryDate) ?? '',
            category: candidate.category ?? 'other',
          };
        }
      }

      if (typeof item === 'string') {
        return {
          id: `${index}-${item}`,
          name: item,
          quantity: '1',
          unit: 'item',
          purchaseDate: '',
          expiryDate: '',
          category: 'other',
        };
      }

      return null;
    })
    .filter((product): product is ParsedProduct => product !== null);
};

const ScanTab = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [products, setProducts] = useState<ParsedProduct[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<ParsedProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);
  const [tempExpiryDate, setTempExpiryDate] = useState<Date | null>(null);
  const [unitIndex, setUnitIndex] = useState(new IndexPath(0));
  const [categoryIndex, setCategoryIndex] = useState(new IndexPath(0));
  const scanMutation = useScanReceipt();

  const primaryButtonStyle = {
    backgroundColor: theme['color-primary-500'],
    borderColor: theme['color-primary-500'],
  };
  const primaryTextStyle = {
    color: resolvedTheme === 'dark' ? theme['color-basic-100'] : (theme['text-control-color'] ?? theme['color-basic-100']),
  };
  const outlineButtonStyle = {
    borderColor: theme['color-primary-500'],
    backgroundColor: 'transparent',
  };
  const outlineTextStyle = {
    color: resolvedTheme === 'dark' ? theme['color-basic-100'] : theme['color-primary-500'],
  };

  const hasResults = products.length > 0;

  const emptyStateMessage = useMemo(() => {
    if (scanError) return scanError;
    if (imageUri) return t('scan.ready_to_scan');
    return t('scan.take_photo_hint');
  }, [scanError, imageUri, t]);

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

  const handleBrowsePhotos = async () => {
    setScanError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('scan.gallery_permission_title'), t('scan.gallery_permission_message'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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
        const responseMessage = typeof (data as { message?: unknown }).message === 'string' ? (data as { message?: string }).message : null;

        setProducts(parsed);
        if (parsed.length === 0) {
          setScanError(responseMessage ?? t('scan.no_products_found'));
          return;
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

  const sanitizeProduct = (draft: ParsedProduct): ParsedProduct => {
    const quantity = Number(draft.quantity);
    const category = (draft.category.trim() || 'other').toLowerCase();
    const purchaseDate = draft.purchaseDate.trim() || toDateInput(new Date());
    const expiryDate = draft.expiryDate.trim() || getDefaultExpiryDate(category, new Date(purchaseDate));

    return {
      ...draft,
      name: draft.name.trim(),
      quantity: Number.isFinite(quantity) && quantity > 0 ? String(quantity) : '1',
      unit: draft.unit.trim() || 'item',
      purchaseDate,
      expiryDate,
      category,
    };
  };

  const toConfirmItem = (draft: ParsedProduct) => {
    const sanitized = sanitizeProduct(draft);
    return {
      name: sanitized.name,
      quantity: Number(sanitized.quantity),
      unit: sanitized.unit,
      purchaseDate: sanitized.purchaseDate,
      expiryDate: sanitized.expiryDate,
      category: sanitized.category,
    };
  };

  const openEditProduct = (product: ParsedProduct) => {
    const category = (product.category || 'other').toLowerCase();
    const purchaseDate = product.purchaseDate?.trim() || toDateInput(new Date());
    const expiryDate = product.expiryDate?.trim() || getDefaultExpiryDate(category, new Date(purchaseDate));

    setEditProduct({
      ...product,
      category,
      purchaseDate,
      expiryDate,
    });
    setUnitIndex(getOptionIndex((product.unit || 'item').toLowerCase(), UNIT_OPTIONS));
    setCategoryIndex(getOptionIndex(category, CATEGORY_OPTIONS));
    setIsEditModalVisible(true);
  };

  const closeEditProduct = () => {
    setIsEditModalVisible(false);
    setEditProduct(null);
    setShowExpiryPicker(false);
    setTempExpiryDate(null);
  };

  const updateEditField = (field: keyof ParsedProduct, value: string) => {
    setEditProduct((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleDeleteEdit = () => {
    if (!editProduct) return;
    setProducts((current) => current.filter((item) => item.id !== editProduct.id));
    closeEditProduct();
  };

  const handleSaveEdit = () => {
    if (!editProduct) return;
    const sanitized = sanitizeProduct(editProduct);
    const invalid = !sanitized.name;

    if (invalid) {
      Alert.alert(t('scan.validation_title'), t('scan.validation_message'));
      return;
    }

    setProducts((current) => current.map((item) => (item.id === sanitized.id ? { ...item, ...sanitized } : item)));
    closeEditProduct();
  };

  const handleConfirmProducts = async () => {
    if (isSaving) return;

    if (products.length === 0) {
      Alert.alert(t('scan.validation_title'), t('scan.no_products_found'));
      return;
    }

    const normalized = products.map(toConfirmItem);
    const invalid = normalized.some((item) => !item.name);

    if (invalid) {
      Alert.alert(t('scan.validation_title'), t('scan.validation_message'));
      return;
    }

    try {
      setIsSaving(true);

      const response = await api.post('/api/scan/receipt/confirm', {
        items: normalized,
      });

      const updated = extractProducts({ products: response.data });

      await queryClient.invalidateQueries({ queryKey: ['products'] });
      setProducts(updated);
      setImageUri(null);
      setScanError(null);
      router.replace({
        pathname: '/scan-success',
        params: { count: String(updated.length) },
      });
    } catch {
      Alert.alert(t('scan.save_error_title'), t('scan.save_error_message'));
    } finally {
      setIsSaving(false);
    }
  };

  const scheduleStateUpdate = (update: () => void) => {
    setTimeout(update, 0);
  };

  const applyUnitSelection = (selected: IndexPath) => {
    if (selected.row === unitIndex.row) return;
    scheduleStateUpdate(() => {
      setUnitIndex(selected);
      updateEditField('unit', UNIT_OPTIONS[selected.row]?.value ?? 'item');
    });
  };

  const applyCategorySelection = (selected: IndexPath) => {
    if (selected.row === categoryIndex.row) return;
    scheduleStateUpdate(() => {
      setCategoryIndex(selected);
      updateEditField('category', CATEGORY_OPTIONS[selected.row]?.value ?? 'other');
    });
  };

  const handleExpiryFieldPress = () => {
    const fallback = editProduct?.expiryDate ? new Date(editProduct.expiryDate) : new Date();
    setTempExpiryDate(fallback);
    setShowExpiryPicker(true);
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

        <View style={styles.actions}>
          <Button onPress={handleCapturePhoto} appearance={'outline'} style={[styles.actionButton, outlineButtonStyle]}>
            <Text style={outlineTextStyle}>{imageUri ? t('scan.retake_photo') : t('scan.open_camera')}</Text>
          </Button>
          <Button onPress={handleBrowsePhotos} appearance="outline" style={[styles.actionButton, outlineButtonStyle]}>
            <Text style={outlineTextStyle}>{t('scan.browse_photos')}</Text>
          </Button>
          <Button
            onPress={handleGetFoodProducts}
            disabled={!imageUri || scanMutation.isPending}
            style={[styles.actionButton, primaryButtonStyle]}
          >
            <Text style={primaryTextStyle}>{t('scan.get_food_products')}</Text>
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
                onPress={() => openEditProduct(product)}
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
            <Button onPress={handleConfirmProducts} disabled={isSaving} style={[styles.actionButton, primaryButtonStyle]}>
              <Text style={primaryTextStyle}>{isSaving ? t('scan.saving') : t('scan.confirm')}</Text>
            </Button>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={isEditModalVisible && !!editProduct} backdropStyle={styles.modalBackdrop}>
        <Card style={[styles.modalCard, { backgroundColor: theme['background-basic-color-1'] }]} disabled>
          <Text category="s1" style={{ color: theme['text-basic-color'] }}>
            {t('scan.edit_title')}
          </Text>
          <Text appearance="hint" style={styles.modalSubtitle}>
            {t('scan.edit_subtitle')}
          </Text>

          {editProduct ? (
            <View style={styles.modalItem}>
              <Input
                label={t('scan.field_name')}
                value={editProduct.name}
                placeholder={t('scan.field_name')}
                onChangeText={(value) => updateEditField('name', value)}
              />
              <View style={styles.modalRow}>
                <Input
                  label={t('scan.field_quantity')}
                  value={editProduct.quantity}
                  keyboardType="decimal-pad"
                  onChangeText={(value) => updateEditField('quantity', value)}
                  style={styles.modalHalf}
                />
                <Select
                  label={t('scan.field_unit')}
                  selectedIndex={unitIndex}
                  value={UNIT_OPTIONS[unitIndex.row]?.label ?? UNIT_OPTIONS[0].label}
                  onSelect={(index) => {
                    const selected = index as IndexPath;
                    applyUnitSelection(selected);
                  }}
                  style={styles.modalHalf}
                >
                  {UNIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} title={option.label} />
                  ))}
                </Select>
              </View>
              <View style={styles.modalRow}>
                <Pressable style={styles.modalHalf} onPressIn={handleExpiryFieldPress} hitSlop={8}>
                  <View pointerEvents="none">
                    <Input label={t('scan.field_expiry_date')} placeholder="YYYY-MM-DD" value={editProduct.expiryDate} editable={false} />
                  </View>
                </Pressable>
              </View>
              <Select
                label={t('scan.field_category')}
                selectedIndex={categoryIndex}
                value={CATEGORY_OPTIONS[categoryIndex.row]?.label ?? CATEGORY_OPTIONS[0].label}
                onSelect={(index) => {
                  const selected = index as IndexPath;
                  applyCategorySelection(selected);
                }}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} title={option.label} />
                ))}
              </Select>
            </View>
          ) : null}

          <View style={styles.modalActions}>
            <Button appearance="ghost" onPress={closeEditProduct}>
              {t('scan.cancel')}
            </Button>
            <Button appearance="ghost" status="danger" onPress={handleDeleteEdit}>
              {t('common.delete')}
            </Button>
            <Button onPress={handleSaveEdit}>{t('common.save')}</Button>
          </View>
        </Card>
      </Modal>

      <RNModal visible={showExpiryPicker} transparent animationType="fade" onRequestClose={() => setShowExpiryPicker(false)}>
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerCard, { backgroundColor: theme['background-basic-color-1'] }]}>
            <DateTimePicker
              value={tempExpiryDate ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
              onChange={(_event, selectedDate) => {
                if (selectedDate) {
                  setTempExpiryDate(selectedDate);
                }
              }}
            />
            <View style={styles.pickerActions}>
              <Button appearance="ghost" onPress={() => setShowExpiryPicker(false)}>
                {t('scan.cancel')}
              </Button>
              <Button
                onPress={() => {
                  if (tempExpiryDate) {
                    updateEditField('expiryDate', toDateInput(tempExpiryDate));
                  }
                  setShowExpiryPicker(false);
                }}
              >
                {t('common.save')}
              </Button>
            </View>
          </View>
        </View>
      </RNModal>
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
  modalBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: '90%',
    maxWidth: 420,
    maxHeight: 600,
    gap: 12,
    alignSelf: 'center',
  },
  modalSubtitle: {
    marginBottom: 4,
  },
  modalList: {
    maxHeight: 360,
  },
  modalListContent: {
    gap: 12,
  },
  modalItem: {
    gap: 10,
  },
  modalItemActions: {
    alignItems: 'flex-end',
  },
  modalRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalHalf: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 16,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default ScanTab;
