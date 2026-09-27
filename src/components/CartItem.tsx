// ============================================================
// Shree Stores - CartItem Component (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { QuantitySelector } from './QuantitySelector';
import { getCategoryIconWithBackground } from '@/utils/categoryIcons';
import { formatPrice } from '@/services/location';
import type { CartItem as CartItemType } from '@/types';
import { useAppStore } from '@/store';
import { Trash2 } from 'lucide-react-native';
import { getProductImage } from '../utils/image';

interface CartItemComponentProps {
  item: CartItemType;
  onRemove: () => void;
}

export function CartItemComponent({
  item,
  onRemove,
}: CartItemComponentProps) {
  const { language } = useTranslation();
  const { incrementCartQuantity, decrementCartQuantity } = useAppStore();
  const { product, quantity, variantId } = item;
  const name = language === 'hi' && product.nameHindi ? product.nameHindi : product.name;
  
  const variant = product.variants?.find(v => v._id === variantId);
  const price = variant?.price || 0;
  const mrp = variant?.mrp || price;
  const unitValue = variant?.unitValue || '';
  const unit = variant?.unit || '';

  const total = price * quantity;
  const categoryIdStr = typeof product.category === 'string' 
    ? product.category 
    : (product.category as any)?._id || '';
  const imageUrl = getProductImage(product);

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.cartItemImage} resizeMode="cover" />
        ) : (
          getCategoryIconWithBackground(categoryIdStr, 'sm')
        )}
      </View>

      {/* Product Details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <Text style={styles.unit}>{unitValue} {unit}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {mrp > price ? (
            <Text style={styles.mrp}>{formatPrice(mrp)}</Text>
          ) : null}
        </View>
      </View>

      {/* Quantity & Total */}
      <View style={styles.rightSection}>
        <Pressable
          onPress={onRemove}
          style={styles.removeButton}
          accessibilityLabel="Remove from cart"
        >
          <Trash2 size={16} color={Colors.error} strokeWidth={2} />
        </Pressable>
        <Text style={styles.total}>{formatPrice(total)}</Text>
        <QuantitySelector
          quantity={quantity}
          onIncrease={() => incrementCartQuantity(product._id, variantId)}
          onDecrease={() => decrementCartQuantity(product._id, variantId)}
          size="md"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  imageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cartItemImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text,
    lineHeight: 18,
  },
  unit: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  mrp: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  total: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
});
