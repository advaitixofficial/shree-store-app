import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography, Spacing } from '@/constants/typography';
import { ProductCard } from '../ProductCard';
import { ChevronRight } from 'lucide-react-native';
import type { Product } from '@/types';
import { useTranslation } from '@/i18n';

interface ProductHorizontalListProps {
  title: string;
  products: Product[];
  categoryId?: string; // If provided, "See All" navigates to category page
}

export function ProductHorizontalList({ title, products, categoryId }: ProductHorizontalListProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {categoryId && (
          <Pressable 
            onPress={() => router.push(`/category/${categoryId}`)}
            style={({ pressed }) => [styles.seeAllButton, pressed && styles.pressed]}
          >
            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
            <ChevronRight size={16} color={Colors.primary} strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            width={140}
            onPress={() => router.push(`/product/${product._id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
});
