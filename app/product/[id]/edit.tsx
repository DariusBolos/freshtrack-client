import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, Modal as RNModal, Platform } from 'react-native';
import { Button, Card, IndexPath, Input, Layout, Select, SelectItem, Text, useTheme } from '@ui-kitten/components';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from '@/components/Spinner';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';

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

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

type DraftProduct = {
  name: string;
  quantity: string;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  category: string;
};

const getOptionIndex = (value: string, options: { label: string; value: string }[]) => {
  const index = options.findIndex((option) => option.value === value);
  return new IndexPath(index >= 0 ? index : 0);
};

const EditProductScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();

  const primaryButtonStyle = {
    backgroundColor: theme['color-primary-500'],
    borderColor: theme['color-primary-500'],
  };
  const primaryTextStyle = {
    color: theme['text-control-color'] ?? theme['color-basic-100'],
  };
  const outlineButtonStyle = {
    borderColor: theme['color-primary-500'],
    backgroundColor: 'transparent',
  };
  const outlineTextStyle = {
    color: theme['color-primary-500'],
  };

  const { data: product, isLoading } = useProduct(id!);
  const { mutate, isPending } = useUpdateProduct();

  const [draft, setDraft] = useState<DraftProduct | null>(null);
  const [unitIndex, setUnitIndex] = useState(new IndexPath(0));
  const [categoryIndex, setCategoryIndex] = useState(new IndexPath(0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'purchase' | 'expiry' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!product) return;
    const category = (product.category || 'other').toLowerCase();
    const nextDraft: DraftProduct = {
      name: product.name,
      quantity: String(product.quantity),
      unit: product.unit || 'item',
      purchaseDate: product.purchaseDate || toDateInput(new Date()),
      expiryDate: product.expiryDate || toDateInput(new Date()),
      category,
    };
    setDraft(nextDraft);
    setUnitIndex(getOptionIndex(nextDraft.unit, UNIT_OPTIONS));
    setCategoryIndex(getOptionIndex(nextDraft.category, CATEGORY_OPTIONS));
  }, [product]);

  const updateField = (field: keyof DraftProduct, value: string) => {
    setDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleOpenDate = (field: 'purchase' | 'expiry') => {
    if (!draft) return;
    setActiveDateField(field);
    const source = field === 'purchase' ? draft.purchaseDate : draft.expiryDate;
    setTempDate(source ? new Date(source) : new Date());
    setShowDatePicker(true);
  };

  const handleSave = () => {
    if (!draft) return;

    const name = draft.name.trim();
    const quantityNumber = Number(draft.quantity);
    if (!name || !Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      Alert.alert(t('scan.validation_title'), t('scan.validation_message'));
      return;
    }

    mutate(
      {
        id: id!,
        payload: {
          name,
          quantity: quantityNumber,
          unit: draft.unit.trim() || 'item',
          purchaseDate: draft.purchaseDate.trim(),
          expiryDate: draft.expiryDate.trim(),
          category: draft.category.trim() || 'other',
        },
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert(t('product_detail.edit_error_title'), t('product_detail.edit_error_message'));
        },
      },
    );
  };

  const cardTitle = useMemo(() => t('product_detail.edit_title'), [t]);

  if (isLoading || !draft) {
    return <Spinner size="medium" />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme['background-basic-color-1'] }]}>
      <Layout style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <FontAwesome5 name="arrow-left" size={18} color={theme['text-basic-color']} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]} numberOfLines={1}>
            {t('product_detail.edit_product')}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={[styles.card, { backgroundColor: theme['background-basic-color-2'] }]}>
            <Text category="s1" style={{ color: theme['text-basic-color'] }}>
              {cardTitle}
            </Text>
            <Text appearance="hint" style={styles.subtitle}>
              {t('product_detail.edit_subtitle')}
            </Text>

            <Input
              label={t('scan.field_name')}
              value={draft.name}
              placeholder={t('scan.field_name')}
              onChangeText={(value) => updateField('name', value)}
            />

            <View style={styles.fieldStack}>
              <Input
                label={t('scan.field_quantity')}
                value={draft.quantity}
                keyboardType="decimal-pad"
                onChangeText={(value) => updateField('quantity', value)}
                style={styles.field}
              />
              <Select
                label={t('scan.field_unit')}
                selectedIndex={unitIndex}
                value={UNIT_OPTIONS[unitIndex.row]?.label ?? UNIT_OPTIONS[0].label}
                onSelect={(index) => {
                  const selected = index as IndexPath;
                  setUnitIndex(selected);
                  updateField('unit', UNIT_OPTIONS[selected.row]?.value ?? 'item');
                }}
                style={styles.field}
              >
                {UNIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} title={option.label} />
                ))}
              </Select>
            </View>

            <View style={styles.fieldStack}>
              <Pressable style={styles.field} onPressIn={() => handleOpenDate('purchase')} hitSlop={8}>
                <View pointerEvents="none">
                  <Input label={t('scan.field_purchase_date')} placeholder="YYYY-MM-DD" value={draft.purchaseDate} editable={false} />
                </View>
              </Pressable>
              <Pressable style={styles.field} onPressIn={() => handleOpenDate('expiry')} hitSlop={8}>
                <View pointerEvents="none">
                  <Input label={t('scan.field_expiry_date')} placeholder="YYYY-MM-DD" value={draft.expiryDate} editable={false} />
                </View>
              </Pressable>
            </View>

            <Select
              label={t('scan.field_category')}
              selectedIndex={categoryIndex}
              value={CATEGORY_OPTIONS[categoryIndex.row]?.label ?? CATEGORY_OPTIONS[0].label}
              onSelect={(index) => {
                const selected = index as IndexPath;
                setCategoryIndex(selected);
                updateField('category', CATEGORY_OPTIONS[selected.row]?.value ?? 'other');
              }}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} title={option.label} />
              ))}
            </Select>

            <View style={styles.actions}>
              <Button
                appearance="outline"
                onPress={() => router.back()}
                disabled={isPending}
                style={[styles.actionButton, outlineButtonStyle]}
              >
                <Text style={outlineTextStyle}>{t('scan.cancel')}</Text>
              </Button>
              <Button
                onPress={handleSave}
                disabled={isPending}
                style={[styles.actionButton, primaryButtonStyle]}
              >
                <Text style={primaryTextStyle}>{t('common.save')}</Text>
              </Button>
            </View>
          </Card>
        </ScrollView>

        <RNModal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.pickerOverlay}>
            <View style={[styles.pickerCard, { backgroundColor: theme['background-basic-color-1'] }]}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'spinner'}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
              />
              <View style={styles.pickerActions}>
                <Button appearance="ghost" onPress={() => setShowDatePicker(false)}>
                  {t('scan.cancel')}
                </Button>
                <Button
                  onPress={() => {
                    if (activeDateField === 'purchase') {
                      updateField('purchaseDate', toDateInput(tempDate));
                    }
                    if (activeDateField === 'expiry') {
                      updateField('expiryDate', toDateInput(tempDate));
                    }
                    setShowDatePicker(false);
                  }}
                >
                  {t('common.save')}
                </Button>
              </View>
            </View>
          </View>
        </RNModal>
      </Layout>
    </SafeAreaView>
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
      marginBottom: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme['background-basic-color-2'],
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
    },
    content: {
      paddingBottom: 12,
      flexGrow: 1,
      justifyContent: 'center',
    },
    card: {
      borderRadius: 16,
      padding: 16,
      gap: 14,
      alignSelf: 'center',
      width: '100%',
      maxWidth: 420,
    },
    subtitle: {
      marginBottom: 4,
    },
    fieldStack: {
      gap: 14,
    },
    field: {
      flex: 1,
    },
    actions: {
      gap: 14,
      marginTop: 0,
    },
    actionButton: {
      width: '100%',
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

export default EditProductScreen;

