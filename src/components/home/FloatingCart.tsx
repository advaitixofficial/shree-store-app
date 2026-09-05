import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { ShoppingBag, ChevronRight } from 'lucide-react-native';

export function FloatingCart() {
  const router = useRouter();
  const { t } = useTranslation();
  const { cart, getCartTotal } = useAppStore();

  const { itemCount, subtotal } = getCartTotal();

  if (itemCount === 0) return null;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push('/(tabs)/cart')}
        style={({ pressed }) => [styles.cartButton, pressed && styles.pressed]}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <ShoppingBag size={20} color={Colors.textWhite} strokeWidth={2} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.itemsText}>{itemCount} {t('items')}</Text>
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
    bottom: Spacing.md,
    left: Spacing.base,
    right: Spacing.base,
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
    color: Colors.primaryLight,
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
