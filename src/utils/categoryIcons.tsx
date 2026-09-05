// ============================================================
// Shree Stores - Category Icon Utility
// Centralized icon mapping for product/category visuals.
// Replaces duplicated getCategoryIcon across multiple files.
// ============================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Carrot,
  Apple,
  Milk,
  Croissant,
  Wheat,
  Pizza,
  Bean,
  Droplets,
  Flame,
  Popcorn,
  CupSoda,
  SprayCan,
  Brush,
  ShoppingBasket,
  type LucideIcon,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';

// Map category IDs to Lucide icons and default colors
const CATEGORY_ICON_MAP: Record<string, { Icon: LucideIcon; color: string }> = {
  'cat-1':  { Icon: Carrot,         color: '#16A34A' },  // Vegetables
  'cat-2':  { Icon: Apple,          color: '#EF4444' },  // Fruits
  'cat-3':  { Icon: Milk,           color: '#3B82F6' },  // Dairy & Milk
  'cat-4':  { Icon: Croissant,      color: '#F97316' },  // Bakery
  'cat-5':  { Icon: Wheat,          color: '#EAB308' },  // Rice & Grains
  'cat-6':  { Icon: Pizza,          color: '#EA580C' },  // Atta & Flour
  'cat-7':  { Icon: Bean,           color: '#78716C' },  // Pulses
  'cat-8':  { Icon: Droplets,       color: '#F59E0B' },  // Oil & Ghee
  'cat-9':  { Icon: Flame,          color: '#EF4444' },  // Masala & Spices
  'cat-10': { Icon: Popcorn,        color: '#F59E0B' },  // Snacks
  'cat-11': { Icon: CupSoda,        color: '#15803D' },  // Beverages
  'cat-12': { Icon: SprayCan,       color: '#3B82F6' },  // Personal Care
  'cat-13': { Icon: Brush,          color: '#F97316' },  // Household
};

const DEFAULT_ICON = { Icon: ShoppingBasket, color: Colors.textSecondary };

/**
 * Get the Lucide icon component for a category.
 * Returns a rendered icon element.
 */
export function getCategoryIcon(
  categoryId: string,
  size: number = 24,
  colorOverride?: string,
): React.ReactElement {
  const { Icon, color } = CATEGORY_ICON_MAP[categoryId] ?? DEFAULT_ICON;
  return <Icon size={size} color={colorOverride ?? color} strokeWidth={1.8} />;
}

/**
 * Get the icon wrapped in a styled circular background.
 * Used for product cards, category cards, and cart items.
 */
export function getCategoryIconWithBackground(
  categoryId: string,
  size: 'sm' | 'md' | 'lg' = 'md',
  bgColor?: string,
): React.ReactElement {
  const { Icon, color } = CATEGORY_ICON_MAP[categoryId] ?? DEFAULT_ICON;
  const config = SIZE_CONFIG[size];

  return (
    <View style={[
      styles.iconContainer,
      {
        width: config.container,
        height: config.container,
        borderRadius: config.container / 2,
        backgroundColor: bgColor ?? (color + '14'), // 8% opacity
      },
    ]}>
      <Icon size={config.icon} color={color} strokeWidth={1.8} />
    </View>
  );
}

const SIZE_CONFIG = {
  sm: { container: 48, icon: 24 },
  md: { container: 72, icon: 36 },
  lg: { container: 120, icon: 60 },
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * Get the raw color for a category.
 */
export function getCategoryColor(categoryId: string): string {
  return CATEGORY_ICON_MAP[categoryId]?.color ?? Colors.textSecondary;
}
