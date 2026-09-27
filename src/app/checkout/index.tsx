// ============================================================
// Shree Stores - Checkout Screen (Redesigned)
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { AddressCard } from '@/components/AddressCard';
import { Button } from '@/components/common/Button';
import { formatPrice, getDeliveryFee, isWithinDeliveryRadius, calculateDistance, defaultStoreSettings } from '@/services/location';
import type { PaymentMethod, Order } from '@/types';
import { ArrowLeft, Banknote, CreditCard, ShoppingCart } from 'lucide-react-native';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { cart, addresses, getCartTotal, placeOrder, clearCart } = useAppStore();
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(
    () => addresses.find((a) => a.isDefault)?._id ?? addresses[0]?._id
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [loading, setLoading] = useState(false);

  // Automatically update selectedAddressId when default address changes or addresses change
  useEffect(() => {
    const currentDefault = addresses.find((a) => a.isDefault) || addresses[0];
    if (currentDefault) {
      setSelectedAddressId(currentDefault._id);
    }
  }, [addresses]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  // Calculate distance for the selected address
  const distanceKm = selectedAddress ? calculateDistance(
    defaultStoreSettings.storeLatitude,
    defaultStoreSettings.storeLongitude,
    selectedAddress.latitude,
    selectedAddress.longitude
  ) : 0;

  const { subtotal, savings } = getCartTotal();
  const deliveryFee = getDeliveryFee(subtotal, distanceKm);
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert(t('checkout'), t('addressRequired'));
      return;
    }

    if (subtotal < defaultStoreSettings.minOrderAmount) {
      Alert.alert(t('checkout'), `${t('minOrderAmount')} ₹${defaultStoreSettings.minOrderAmount}`);
      return;
    }

    // Check delivery radius
    const isInRange = isWithinDeliveryRadius(
      selectedAddress.latitude,
      selectedAddress.longitude
    );
    if (!isInRange) {
      Alert.alert(t('deliveryNotAvailable'), t('deliveryNotAvailableDesc'));
      return;
    }

    setLoading(true);

    try {
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const orderRes = await import('@/api/orders').then(m => m.orderApi.createOrder({
        addressId: selectedAddress._id,
        paymentMethod,
        discountCode: undefined // TODO: handle coupons
      } as any, idempotencyKey)) as any;

      if (paymentMethod === 'ONLINE' && orderRes.paymentSessionId) {
        // Order is created in backend (cart is cleared there). Clear frontend cart.
        await clearCart();
        
        // Navigate to payment screen replacing checkout
        router.replace({
          pathname: '/payment/cashfree',
          params: {
            paymentSessionId: orderRes.paymentSessionId,
            cashfreeEnv: orderRes.cashfreeEnv || 'sandbox',
            orderId: orderRes._id,
            orderNumber: orderRes.orderNumber,
            totalAmount: grandTotal.toString(),
          },
        });
      } else {
        // COD — go directly to confirmation
        await clearCart();
        router.replace({
          pathname: '/order/confirmation',
          params: { orderId: orderRes._id, orderNumber: orderRes.orderNumber },
        });
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      Alert.alert('Error', error?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>{t('checkout')}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('deliveryAddress')}</Text>
            <Pressable onPress={() => router.push('/address')} style={({ pressed }) => pressed && styles.pressed}>
              <Text style={styles.changeText}>{t('changeAddress')}</Text>
            </Pressable>
          </View>
          {selectedAddress ? (
            <AddressCard address={selectedAddress} selected />
          ) : (
            <Button
              title={t('addAddress')}
              onPress={() => router.push('/address/add')}
              variant="outline"
              fullWidth
            />
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderSummary')}</Text>
          <View style={styles.summaryCard}>
            {cart.items.map((item) => {
              const variant = item.product.variants?.find(v => v._id === item.variantId);
              const price = variant?.price || 0;
              const unit = variant ? `${variant.unitValue} ${variant.unit}` : '';
              return (
              <View key={item.product._id + '-' + item.variantId} style={styles.summaryItem}>
                <Text style={styles.summaryName} numberOfLines={1}>
                  {item.product.name} ({unit})
                </Text>
                <Text style={styles.summaryQty}>x{item.quantity}</Text>
                <Text style={styles.summaryPrice}>
                  {formatPrice(price * item.quantity)}
                </Text>
              </View>
            )})}
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('itemTotal')}</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('deliveryCharges')}</Text>
              <Text style={[styles.summaryValue, deliveryFee === 0 && styles.freeText]}>
                {deliveryFee === 0 ? t('freeDelivery') : formatPrice(deliveryFee)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.totalLabel}>{t('grandTotal')}</Text>
              <Text style={styles.totalValue}>{formatPrice(grandTotal)}</Text>
            </View>
            {savings > 0 ? (
              <View style={styles.savingsRow}>
                <Text style={styles.savingsText}>
                  🎉 {t('youSave')} {formatPrice(savings)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('paymentMethod')}</Text>
          <Pressable
            onPress={() => setPaymentMethod('COD')}
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
          >
            <View style={[styles.radioOuter, paymentMethod === 'COD' && styles.radioOuterActive]}>
              {paymentMethod === 'COD' ? <View style={styles.radioInner} /> : null}
            </View>
            <Banknote size={22} color={paymentMethod === 'COD' ? Colors.primary : Colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.paymentLabel, paymentMethod === 'COD' && styles.paymentLabelActive]}>{t('cashOnDelivery')}</Text>
          </Pressable>
          
          <Pressable
            disabled={true}
            style={[styles.paymentOption, styles.paymentOptionDisabled]}
          >
            <View style={styles.radioOuter} />
            <CreditCard size={22} color={Colors.textTertiary} strokeWidth={2} />
            <View style={styles.paymentLabelWrapper}>
              <Text style={[styles.paymentLabel, { color: Colors.textTertiary }]}>{t('onlinePayment')}</Text>
              <Text style={styles.comingSoon}>{t('onlinePaymentSoon')}</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* Place Order Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerTotal}>{formatPrice(grandTotal)}</Text>
          {subtotal < defaultStoreSettings.minOrderAmount ? (
            <Text style={[styles.footerItems, { color: Colors.error }]}>
              Min order: ₹{defaultStoreSettings.minOrderAmount}
            </Text>
          ) : (
            <Text style={styles.footerItems}>
              {cart.items.length} {t('items')}
            </Text>
          )}
        </View>
        <Button
          title={t('placeOrder')}
          onPress={handlePlaceOrder}
          size="lg"
          loading={loading}
          disabled={!selectedAddress || subtotal < defaultStoreSettings.minOrderAmount}
          style={styles.placeOrderButton}
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
    padding: Spacing.base,
    paddingBottom: 110,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  changeText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryName: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  summaryQty: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.textSecondary,
    marginRight: Spacing.base,
  },
  summaryPrice: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  freeText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.semibold,
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
  savingsRow: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  savingsText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primaryDark,
    fontWeight: Typography.weight.semibold,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  paymentOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  paymentOptionDisabled: {
    opacity: 0.6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  paymentLabelActive: {
    color: Colors.primaryDark,
    fontWeight: Typography.weight.bold,
  },
  paymentLabelWrapper: {
    gap: 2,
  },
  comingSoon: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
  },
  footer: {
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
  footerLeft: {
    gap: 2,
  },
  footerTotal: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  footerItems: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.textSecondary,
  },
  placeOrderButton: {
    minWidth: 180,
  },
  pressed: {
    opacity: 0.7,
  },
});

