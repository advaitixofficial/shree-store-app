// ============================================================
// Shree Stores - Cart Screen (Redesigned)
// ============================================================

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { CartItemComponent } from '@/components/CartItem';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatPrice, getDeliveryFee, defaultStoreSettings } from '@/services/location';
import { ShoppingBag, Sparkles, AlertCircle } from 'lucide-react-native';

export default function CartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { cart, removeFromCart, getCartTotal, syncCart } = useAppStore();
  const { subtotal, savings, itemCount } = getCartTotal();
  const deliveryFee = getDeliveryFee(subtotal);
  const grandTotal = subtotal + deliveryFee;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await syncCart();
    setRefreshing(false);
  }, [syncCart]);

  // Free delivery progress calculation
  const freeDeliveryLimit = defaultStoreSettings.freeDeliveryAbove;
  const deliveryFreeProgress = Math.min((subtotal / freeDeliveryLimit) * 100, 100);
  const remainingForFreeDelivery = freeDeliveryLimit - subtotal;

  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('myCart')}</Text>
        </View>
        <ScrollView contentContainerStyle={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}>
          <EmptyState
            icon={<ShoppingBag size={48} color={Colors.textSecondary} strokeWidth={1.5} />}
            title={t('cartEmpty')}
            subtitle={t('cartEmptyDesc')}
            actionTitle={t('startShopping')}
            onAction={() => router.push('/(tabs)')}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('myCart')}</Text>
          <Text style={styles.itemCountText}>
            {itemCount} {itemCount > 1 ? t('items') : t('item')}
          </Text>
        </View>
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        renderItem={({ item }) => (
          <CartItemComponent
            item={item}
            onRemove={() => removeFromCart(item.product._id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          subtotal < freeDeliveryLimit ? (
            <View style={styles.freeDeliveryBanner}>
              <View style={styles.freeDeliveryBannerTextRow}>
                <AlertCircle size={16} color={Colors.orangeDark} />
                <Text style={styles.freeDeliveryText}>
                  Add <Text style={styles.boldText}>{formatPrice(remainingForFreeDelivery)}</Text> more for free delivery
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${deliveryFreeProgress}%` }]} />
              </View>
            </View>
          ) : (
            <View style={styles.freeDeliverySuccessBanner}>
              <Sparkles size={16} color={Colors.primary} />
              <Text style={styles.freeDeliverySuccessText}>
                Awesome! Your order gets <Text style={styles.boldSuccessText}>FREE Delivery</Text>
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <View style={styles.billSection}>
            {/* Savings Banner */}
            {savings > 0 ? (
              <View style={styles.savingsBanner}>
                <Sparkles size={20} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.savingsText}>
                  {t('youSave')} {formatPrice(savings)} on this order!
                </Text>
              </View>
            ) : null}

            {/* Bill Details */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>{t('orderSummary')}</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>{t('itemTotal')}</Text>
                <Text style={styles.billValue}>{formatPrice(subtotal)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>{t('deliveryFee')}</Text>
                <Text style={[styles.billValue, deliveryFee === 0 && styles.freeText]}>
                  {deliveryFee === 0 ? t('freeDelivery') : formatPrice(deliveryFee)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.billRow}>
                <Text style={styles.totalLabel}>{t('grandTotal')}</Text>
                <Text style={styles.totalValue}>{formatPrice(grandTotal)}</Text>
              </View>
            </View>
          </View>
        }
      />

      {/* Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutLeft}>
          <Text style={styles.checkoutTotal}>{formatPrice(grandTotal)}</Text>
          <Text style={styles.checkoutItems}>{itemCount} {t('items')}</Text>
        </View>
        <Button
          title={t('proceedToCheckout')}
          onPress={() => router.push('/checkout')}
          size="md"
          style={styles.checkoutButton}
        />
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
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
  itemCountText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  list: {
    padding: Spacing.base,
  },
  separator: {
    height: Spacing.sm,
  },

  // Free delivery progress banner
  freeDeliveryBanner: {
    backgroundColor: Colors.orangeLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.15)',
  },
  freeDeliveryBannerTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeDeliveryText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.orangeDark,
  },
  boldText: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.orange,
    borderRadius: 3,
  },
  freeDeliverySuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
  },
  freeDeliverySuccessText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primaryDark,
  },
  boldSuccessText: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '700',
  },

  billSection: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: 100, // Safe padding above bottom bar
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.15)',
  },
  savingsText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primaryDark,
  },
  billCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  billTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  billValue: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  freeText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  totalValue: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primaryDark,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    ...Shadows.bottomBar,
  },
  checkoutLeft: {
    gap: 2,
  },
  checkoutTotal: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  checkoutItems: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.textSecondary,
  },
  checkoutButton: {
    minWidth: 180,
  },
});
