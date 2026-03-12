import React, { useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, useTheme } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { FontAwesome5 } from '@expo/vector-icons';
import FoodProductCard from '@/components/inventory/FoodProductCard';
import { FoodProduct } from '@/types/productTypes';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { sortProductsByExpiryDate } from '@/utils/productUtils';

const InventoryTab = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data: products } = useProducts();
  const { mutate: deleteProduct } = useDeleteProduct();
  const sortedProducts = useMemo(() => sortProductsByExpiryDate(products!), [products]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteProduct(id);
    },
    [deleteProduct],
  );

  const renderItem = ({ item }: { item: FoodProduct }) => <FoodProductCard product={item} onDelete={handleDelete} />;

  const ListHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <FontAwesome5 name="boxes" size={22} color={theme['color-primary-500']} />
        <Text style={[styles.headerTitle, { color: theme['text-basic-color'] }]}>{t('inventory.title')}</Text>
      </View>
      <Text style={[styles.headerSub, { color: theme['text-hint-color'] }]}>
        {t('inventory.subtitle', { count: sortedProducts.length })}
      </Text>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      <FontAwesome5 name="receipt" size={48} color={theme['text-disabled-color']} />
      <Text style={[styles.emptyText, { color: theme['text-hint-color'] }]}>{t('inventory.empty')}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme['background-basic-color-1'] }]}>
      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 14,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 14,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});

export default InventoryTab;
