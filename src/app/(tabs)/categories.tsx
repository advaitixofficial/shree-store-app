// ============================================================
// Shree Stores - Categories Screen (Redesigned)
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { catalogApi } from '@/api/catalog';
import type { Category } from '@/types';
import { getCategoryIconWithBackground } from '@/utils/categoryIcons';

export default function CategoriesScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await catalogApi.getCategories();
        setCategories(res);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const renderCategory = ({ item }: { item: Category }) => {
    const name = language === 'hi' ? item.nameHindi : item.name;
    const imageUrl = item.image?.url;
    return (
      <Pressable
        onPress={() => router.push(`/category/${item._id}`)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.iconContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.categoryImage} resizeMode="cover" />
          ) : (
            getCategoryIconWithBackground(item._id, 'md')
          )}
        </View>
        <Text style={styles.cardName} numberOfLines={2}>{name}</Text>
        <Text style={styles.cardCount}>Items</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('categories')}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: Spacing['3xl'] }} />
      ) : (
        <FlatList
          data={categories}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
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
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  row: {
    justifyContent: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    maxWidth: '31%',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: Colors.backgroundSecondary,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: BorderRadius.md,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  cardName: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
    height: 32, // Consistent height for 2 lines
  },
  cardCount: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
    marginTop: -2,
  },
});
