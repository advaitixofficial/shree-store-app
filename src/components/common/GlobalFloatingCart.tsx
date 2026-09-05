// ============================================================
// Shree Stores - Global Floating Cart Bar
// Appears on every screen when cart has items.
// Rendered from layout files — DO NOT duplicate in screens.
// ============================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';

interface GlobalFloatingCartProps {
  /** Extra bottom offset to clear the tab bar when inside tabs */
  bottomOffset?: number;
}

export function GlobalFloatingCart({ bottomOffset = 0 }: GlobalFloatingCartProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { getCartTotal } = useAppStore();

  const { itemCount, subtotal } = getCartTotal();

  // Only show on homepage when cart has items
  if (itemCount === 0) return null;

  const isAllowedPath =
    pathname === '/' ||
    pathname === '/categories' ||
    pathname.startsWith('/category/') ||
    // Keep raw route matches just in case
    pathname === '/(tabs)' ||
    pathname === '/(tabs)/index' ||
    pathname === '/(tabs)/' ||
    pathname === '/(tabs)/categories';

  if (!isAllowedPath) return null;

  return (
    <View style={[styles.container, { bottom: bottomOffset + Spacing.sm }]}>
      <Pressable
        onPress={() => router.push('/(tabs)/cart')}
        style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <ShoppingBag size={20} color={Colors.textWhite} strokeWidth={2} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.itemsText}>
              {itemCount} {itemCount === 1 ? 'item' : t('items')}
            </Text>
            <Text style={styles.priceText}>₹{subtotal}</Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.checkoutText}>{t('myCart')}</Text>
          <ChevronRight size={20} color={Colors.textWhite} strokeWidth={2.5} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 100,
    ...Shadows.lg,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    elevation: 8,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  pressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: Colors.orange,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  itemsText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  priceText: {
    color: Colors.textWhite,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkoutText: {
    color: Colors.textWhite,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
});
