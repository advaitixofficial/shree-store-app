// ============================================================
// Shree Stores - CategoryCard Component (Redesigned)
// ============================================================

import React from 'react';
import { Pressable, Text, Image, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { getCategoryIcon } from '@/utils/categoryIcons';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  size?: 'sm' | 'md';
}

export function CategoryCard({ category, onPress, size = 'md' }: CategoryCardProps) {
  const { language } = useTranslation();
  const name = language === 'hi' ? category.nameHindi : category.name;
  const isSm = size === 'sm';
  const imageUrl = category.image?.url;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isSm && styles.containerSm,
        pressed && styles.pressed,
      ]}
    >
      <View style={[
        styles.iconWrapper,
        {backgroundColor: Colors.backgroundGrey},
        isSm && styles.iconWrapperSm,
      ]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.categoryImage, isSm && styles.categoryImageSm]}
            resizeMode="cover"
          />
        ) : (
          getCategoryIcon(category._id, isSm ? 24 : 28)
        )}
      </View>
      <Text
        style={[styles.name, isSm && styles.nameSm]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    gap: Spacing.sm,
  },
  containerSm: {
    width: 70,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  iconWrapperSm: {
    width: 52,
    height: 52,
  },
  name: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  nameSm: {
    fontSize: Typography.size.xs,
    lineHeight: 14,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
  },
  categoryImageSm: {
    width: 52,
    height: 52,
  },
});
