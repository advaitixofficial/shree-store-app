import React, { memo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { QuantitySelector } from './QuantitySelector';
import { getCategoryIconWithBackground } from '@/utils/categoryIcons';
import { getProductImage } from '@/utils/image';
import type { Product } from '@/types';

// Helper to calculate discount percentage
function getDiscountPercent(mrp: number, price: number) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

// Helper to format currency
function formatPrice(price: number) {
  return `₹${price}`;
}

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number;
}

function ProductCardComponent({ product, onPress, width = 140 }: ProductCardProps) {
  const { language } = useTranslation();
  const { addToCart, incrementCartQuantity, decrementCartQuantity, getCartItemQuantity } = useAppStore();
  
  const variant = product.variants?.[0] || { price: 0, mrp: 0, unit: '', unitValue: 0, stock: 0, isAvailable: false, _id: '' };
  const quantity = getCartItemQuantity(product._id, variant._id);
  const name = language === 'hi' && product.nameHindi ? product.nameHindi : product.name;
  const discountPercent = variant.mrp ? getDiscountPercent(variant.mrp, variant.price) : 0;
  
  const categoryId = typeof product.category === 'string' ? product.category : (product.category as any)?._id || '';
  const imageUrl = getProductImage(product);

  const handleAdd = () => {
    if (variant.isAvailable) addToCart(product, variant._id);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, { width }, pressed && styles.pressed]}
      accessibilityLabel={name}
    >
      {/* Image Area */}
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          getCategoryIconWithBackground(categoryId, 'md')
        )}
        
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}
        
        {!variant.isAvailable && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <View style={styles.titleContainer}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.unit}>{variant.unitValue || 1} {variant.unit}</Text>
        </View>

        {/* Price & Action */}
        <View style={styles.bottomRow}>
          <View style={styles.prices}>
            <Text style={styles.price}>{formatPrice(variant.price)}</Text>
            {variant.mrp && variant.mrp > variant.price && (
              <Text style={styles.mrp}>{formatPrice(variant.mrp)}</Text>
            )}
          </View>

          <View style={styles.actionContainer}>
            {quantity > 0 ? (
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => incrementCartQuantity(product._id, variant._id)}
                onDecrease={() => decrementCartQuantity(product._id, variant._id)}
                size="sm"
              />
            ) : (
              <Pressable
                onPress={handleAdd}
                disabled={!variant.isAvailable}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                  !variant.isAvailable && styles.addButtonDisabled,
                ]}
              >
                <Text style={styles.addButtonText}>ADD</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Memoize to prevent unnecessary re-renders in FlatLists
export const ProductCard = memo(ProductCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  imageWrapper: {
    height: 130,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: Spacing.sm,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.textWhite,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  outOfStockText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.error,
  },
  info: {
    padding: Spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text,
    lineHeight: 18,
    height: 36, // Force two lines height
  },
  unit: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    marginTop: 'auto',
  },
  prices: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: Typography.size.base,
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
  actionContainer: {
    height: 32,
    justifyContent: 'flex-end',
  },
  addButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    backgroundColor: Colors.primary,
  },
  addButtonDisabled: {
    opacity: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundGrey,
  },
  addButtonText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
  },
});
