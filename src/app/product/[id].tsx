// ============================================================
// Shree Stores - Product Detail Screen (Redesigned)
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, StyleSheet, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { QuantitySelector } from '@/components/QuantitySelector';
import { ProductList } from '@/components/ProductList';
import { Button } from '@/components/common/Button';
import { formatPrice, getDiscountPercent } from '@/services/location';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react-native';
import { getCategoryIconWithBackground } from '@/utils/categoryIcons';
import { catalogApi } from '@/api/catalog';
import { getProductImage } from '@/utils/image';
import type { Product } from '@/types';

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useTranslation();
  const { addToCart, incrementCartQuantity, decrementCartQuantity, getCartItemQuantity } = useAppStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 50 }).current;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) throw new Error('Product ID missing');

        const p = await catalogApi.getProductById(id as string);
        setProduct(p);
        if (p.variants && p.variants.length > 0) {
          setSelectedVariantId(p.variants[0]._id);
        }

        // Fetch related products
        const categoryId = typeof p.category === 'string' ? p.category : p.category._id;
        const relatedRes = await catalogApi.getProducts({ category: categoryId, limit: 10 });
        setRelatedProducts(relatedRes.products.filter((item) => item._id !== id));
      } catch (e: any) {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <AlertCircle size={48} color={Colors.error} style={{ marginBottom: Spacing.md }} />
        <Text style={styles.notFound}>{error || 'Product not found'}</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: Spacing.lg }} />
      </SafeAreaView>
    );
  }

  const selectedVariant = product.variants?.find(v => v._id === selectedVariantId) || product.variants?.[0] || {
    price: 0, mrp: 0, unit: '', unitValue: 0, stock: 0, isAvailable: false, _id: ''
  };

  const quantity = getCartItemQuantity(product._id, selectedVariant._id);
  const name = language === 'hi' && product.nameHindi ? product.nameHindi : product.name;
  const description = language === 'hi' && product.descriptionHindi ? product.descriptionHindi : product.description;
  const discountPercent = selectedVariant.mrp ? getDiscountPercent(selectedVariant.mrp, selectedVariant.price) : 0;
  const categoryIdStr = typeof product.category === 'string' ? product.category : product.category._id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('productDetails')}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}>
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          {product.images && product.images.length > 0 ? (
            <>
              <FlatList
                data={product.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(img, index) => img.publicId || index.toString()}
                renderItem={({ item: img }) => (
                  <Image
                    source={{ uri: img.secure_url || img.url }}
                    style={styles.productDetailImage}
                    resizeMode="contain"
                  />
                )}
              />
              {product.images.length > 1 && (
                <View style={styles.paginationDots}>
                  {product.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        activeImageIndex === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : getProductImage(product) ? (
            <Image source={{ uri: getProductImage(product)! }} style={styles.productDetailImage} resizeMode="contain" />
          ) : (
            <View style={[styles.productDetailImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>{language === 'hi' ? 'कोई चित्र नहीं' : 'No image'}</Text>
            </View>
          )}
          {discountPercent > 0 ? (
            <View style={styles.discountBadge}>
              <Sparkles size={12} color={Colors.textWhite} strokeWidth={2} />
              <Text style={styles.discountText}>{discountPercent}% {t('off')}</Text>
            </View>
          ) : null}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{name}</Text>
            {language === 'en' && product.nameHindi ? (
              <Text style={styles.productNameHi}>{product.nameHindi}</Text>
            ) : null}
            <Text style={styles.unit}>{selectedVariant.unitValue} {selectedVariant.unit}</Text>
          </View>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatPrice(selectedVariant.price)}</Text>
              {(selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price) ? (
                <Text style={styles.mrp}>{t('mrp')}: {formatPrice(selectedVariant.mrp)}</Text>
              ) : null}
            </View>
            {(selectedVariant.mrp && selectedVariant.mrp > selectedVariant.price) ? (
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>
                  {t('youSave')} {formatPrice(selectedVariant.mrp - selectedVariant.price)}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.inclusive}>{t('inclusive')}</Text>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 1 && (
            <View style={styles.variantsSection}>
              <Text style={styles.variantsTitle}>Select Quantity</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantsList}>
                {product.variants.map((v) => {
                  const isSelected = v._id === selectedVariantId;
                  return (
                    <Pressable
                      key={v._id}
                      style={[styles.variantItem, isSelected && styles.variantItemSelected]}
                      onPress={() => setSelectedVariantId(v._id)}
                    >
                      <Text style={[styles.variantUnit, isSelected && styles.variantUnitSelected]}>
                        {v.unitValue} {v.unit}
                      </Text>
                      <Text style={[styles.variantPrice, isSelected && styles.variantPriceSelected]}>
                        {formatPrice(v.price)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Availability */}
          {!selectedVariant.isAvailable && (
            <View style={styles.outOfStockAlert}>
              <AlertCircle size={16} color={Colors.error} />
              <Text style={styles.outOfStockAlertText}>Currently Out of Stock</Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>{t('description')}</Text>
            <Text style={styles.descText}>{description}</Text>
          </View>
        </View>

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <ProductList
            title={t('relatedProducts')}
            products={relatedProducts}
            onProductPress={(p) => router.push(`/product/${p._id}`)}
          />
        ) : null}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        {quantity > 0 ? (
          <View style={styles.bottomBarContent}>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => incrementCartQuantity(product._id, selectedVariant._id)}
              onDecrease={() => decrementCartQuantity(product._id, selectedVariant._id)}
              size="md"
            />
            <Button
              title={`${t('cart')} • ${formatPrice(selectedVariant.price * quantity)}`}
              onPress={() => router.push('/(tabs)/cart')}
              size="md"
              style={styles.goToCartButton}
            />
          </View>
        ) : (
          <Button
            title={t('addToCart')}
            onPress={() => addToCart(product, selectedVariant._id)}
            fullWidth
            size="lg"
            disabled={!selectedVariant.isAvailable}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  notFound: {
    fontSize: Typography.size.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
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
  headerTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  scrollContent: {
    paddingBottom: 120, // safe padding for bottom sticky bar
  },
  imageSection: {
    height: 300,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  productDetailImage: {
    width: Dimensions.get('window').width,
    height: 300,
  },
  placeholderImage: {
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
  },
  paginationDots: {
    position: 'absolute',
    bottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.textWhite,
  },
  infoSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  titleRow: {
    gap: 2,
  },
  productName: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    lineHeight: 28,
  },
  productNameHi: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  unit: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  priceContainer: {
    gap: 2,
  },
  price: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  mrp: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  saveText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.textWhite,
  },
  inclusive: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  outOfStockAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  outOfStockAlertText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.error,
  },
  descSection: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  descTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  descText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.bottomBar,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  goToCartButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  variantsSection: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  variantsTitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  variantsList: {
    paddingBottom: Spacing.xs,
  },
  variantItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    minWidth: 80,
  },
  variantItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10', // 10% opacity
  },
  variantUnit: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.text,
  },
  variantUnitSelected: {
    color: Colors.primary,
  },
  variantPrice: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    marginTop: 2,
  },
  variantPriceSelected: {
    color: Colors.primary,
  },
});
