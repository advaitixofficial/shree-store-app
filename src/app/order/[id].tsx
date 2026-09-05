// ============================================================
// Shree Stores - Order Detail Screen (Redesigned)
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { orderApi } from '@/api/orders';
import { Order } from '@/types';
import { OrderStatusTimeline } from '@/components/OrderStatus';
import { formatPrice } from '@/services/location';
import { ArrowLeft, Phone, User, MapPin } from 'lucide-react-native';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useTranslation();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrders(1, 100);
        const found = res.orders.find(o => o._id === id);
        if (found) setOrder(found);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Order not found</Text>
      </SafeAreaView>
    );
  }

  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCallEmployee = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('orderDetails')}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order ID & Date */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>

        {/* Order Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('trackOrder')}</Text>
          <View style={styles.timelineCard}>
            <OrderStatusTimeline currentStatus={order.orderStatus} />
          </View>
        </View>

        {/* Assigned Employee */}
        {order.assignedEmployee ? (
          <View style={styles.employeeCard}>
            <View style={styles.employeeAvatar}>
              <User size={20} color={Colors.textWhite} strokeWidth={2} />
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{order.assignedEmployee}</Text>
              <Text style={styles.employeeRole}>Trusted Store Partner</Text>
            </View>
          </View>
        ) : null}

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('items')} ({order.items.length})
          </Text>
          <View style={styles.itemsCard}>
            {order.items.map((item, index) => {
              const itemName = language === 'hi' ? item.productNameHindi : item.productName;
              return (
                <View key={index}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemQty}>{item.quantity}x</Text>
                      <Text style={styles.itemName} numberOfLines={1}>{itemName}</Text>
                    </View>
                    <Text style={styles.itemPrice}>{formatPrice(item.total)}</Text>
                  </View>
                  {index < order.items.length - 1 ? (
                    <View style={styles.itemDivider} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        {/* Bill */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orderSummary')}</Text>
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>{t('itemTotal')}</Text>
              <Text style={styles.billValue}>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>{t('deliveryFee')}</Text>
              <Text style={[styles.billValue, order.deliveryFee === 0 && styles.freeText]}>
                {order.deliveryFee === 0 ? t('freeDelivery') : formatPrice(order.deliveryFee)}
              </Text>
            </View>
            {order.discount > 0 ? (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>{t('discount')}</Text>
                <Text style={[styles.billValue, styles.discountText]}>
                  -{formatPrice(order.discount)}
                </Text>
              </View>
            ) : null}
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={styles.totalLabel}>{t('grandTotal')}</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>{t('paymentMethod')}</Text>
              <Text style={styles.paymentValue}>
                {order.paymentMethod === 'COD' ? t('cashOnDelivery') : t('onlinePayment')}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('deliveryAddress')}</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressHeaderRow}>
              <MapPin size={18} color={Colors.textSecondary} />
              <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
            </View>
            <Text style={styles.addressText}>
              {[order.shippingAddress.addressLine1, order.shippingAddress.addressLine2, order.shippingAddress.landmark, order.shippingAddress.city, order.shippingAddress.postalCode]
                .filter(Boolean)
                .join(', ')}
            </Text>
            <Text style={styles.addressPhone}>Phone: {order.shippingAddress.phone}</Text>
          </View>
        </View>
      </ScrollView>
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
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  orderHeader: {
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.xs,
  },
  orderId: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  orderDate: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  timelineCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  employeeRole: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  itemQty: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primary,
    minWidth: 24,
  },
  itemName: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    flex: 1,
  },
  itemPrice: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  billCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    ...Shadows.sm,
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
    fontWeight: Typography.weight.semibold,
  },
  discountText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  billDivider: {
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
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primaryDark,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  paymentLabel: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  addressCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 6,
    ...Shadows.sm,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  addressName: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  addressText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 24,
  },
  addressPhone: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    paddingLeft: 24,
  },
  pressed: {
    opacity: 0.7,
  },
});
