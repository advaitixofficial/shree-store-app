// ============================================================
// Shree Stores - Category Listing Screen (Redesigned)
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, Shadows, BorderRadius } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { ProductCard } from '@/components/ProductCard';
import { EmptyState } from '@/components/common/EmptyState';
import { catalogApi } from '@/api/catalog';
import type { Category, Product } from '@/types';
import { ArrowLeft, Box } from 'lucide-react-native';
import { getCategoryIcon } from '@/utils/categoryIcons';

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useTranslation();

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const [catRes, prodRes] = await Promise.all([
          catalogApi.getCategoryById(id as string),
          catalogApi.getProducts({ category: id as string, page: 1, limit: 12 })
        ]);
        setCategory(catRes);
        setProducts(prodRes.products);
        setHasMore(prodRes.page < prodRes.totalPages);
        setPage(1);
      } catch (e) {
        // error
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [id]);

  const loadMore = async () => {
    if (!loading && hasMore) {
      try {
        const prodRes = await catalogApi.getProducts({ category: id as string, page: page + 1, limit: 12 });
        setProducts(prev => [...prev, ...prodRes.products]);
        setHasMore(prodRes.page < prodRes.totalPages);
        setPage(page + 1);
      } catch (e) {
        // error
      }
    }
  };

  const categoryName = category
    ? (language === 'hi' && category.nameHindi) ? category.nameHindi : category.name
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.iconContainer}>
            {category?.image?.url ? (
              <Image source={{ uri: category.image.url }} style={styles.headerCategoryImage} resizeMode="cover" />
            ) : (
              category ? getCategoryIcon(category._id, 20) : null
            )}
          </View>
          <Text style={styles.headerTitle}>{categoryName}</Text>
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Box size={40} color={Colors.textSecondary} />}
          title="No products found"
          subtitle="Check back soon!"
        />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          keyExtractor={(item) => item._id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                product={item}
                onPress={() => router.push(`/product/${item._id}`)}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButtonPlaceholder: {
    width: 44,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerCategoryImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
  pressed: {
    opacity: 0.7,
  },
});
