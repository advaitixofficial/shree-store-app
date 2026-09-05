// ============================================================
// Shree Stores - ProductList Component (Horizontal Section - Redesigned)
// ============================================================

import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, Spacing } from '@/constants/typography';
import { ProductCard } from './ProductCard';
import { useTranslation } from '@/i18n';
import type { Product } from '@/types';
import { ArrowRight } from 'lucide-react-native';

interface ProductListProps {
  title: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  onSeeAll?: () => void;
}

export function ProductList({ title, products, onProductPress, onSeeAll }: ProductListProps) {
  const { t } = useTranslation();

  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} style={({ pressed }) => [styles.seeAllRow, pressed && styles.pressed]}>
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
            <ArrowRight size={14} color={Colors.primary} strokeWidth={2.5} />
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => onProductPress(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAll: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 4, // Allow for shadow rendering
  },
  separator: {
    width: Spacing.base,
  },
});
