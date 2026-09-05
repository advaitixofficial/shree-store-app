import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryCard } from '../CategoryCard';
import { Spacing } from '@/constants/typography';
import type { Category } from '@/types';

interface CategoryScrollerProps {
  categories: Category[];
}

export function CategoryScroller({ categories }: CategoryScrollerProps) {
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            size="sm"
            onPress={() => router.push(`/category/${category._id}`)}
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
  scrollContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
});
