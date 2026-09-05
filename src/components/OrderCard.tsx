// ============================================================
// Shree Stores - OrderCard Component (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { Badge } from './ui/Badge';
import { formatPrice } from '@/services/location';
import type { Order, OrderStatus } from '@/types';
import { ChevronRight, RefreshCw } from 'lucide-react-native';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onReorder?: () => void;
}

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'orange' | 'neutral';

export function OrderCard({ order, onPress, onReorder }: OrderCardProps) {
  const { t } = useTranslation();

  const getStatusConfig = (status: OrderStatus): { text: string; variant: BadgeVariant } => {
    const configs: Record<OrderStatus, { text: string; variant: BadgeVariant }> = {
      PLACED: { text: t('orderStatusPlaced'), variant: 'orange' },
      ACCEPTED: { text: t('orderStatusAccepted'), variant: 'info' },
      REJECTED: { text: t('orderStatusCancelled'), variant: 'error' },
      PREPARING: { text: t('orderStatusPreparing'), variant: 'warning' },
      READY: { text: t('orderStatusReady'), variant: 'success' },
      OUT_FOR_DELIVERY: { text: t('orderStatusOutForDelivery'), variant: 'info' },
      DELIVERED: { text: t('orderStatusDelivered'), variant: 'success' },
      CANCELLED: { text: t('orderStatusCancelled'), variant: 'error' },
    };
    return configs[status] ?? { text: status, variant: 'neutral' };
  };

  const statusConfig = getStatusConfig(order.orderStatus);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>{order.orderNumber}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <Badge text={statusConfig.text} variant={statusConfig.variant} size="sm" />
      </View>

      {/* Items Summary */}
      <Text style={styles.itemsSummary}>
        {itemCount} {itemCount > 1 ? t('items') : t('item')}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.total}>{formatPrice(order.total)}</Text>
        <View style={styles.footerRight}>
          {order.orderStatus === 'DELIVERED' && onReorder ? (
            <Pressable onPress={onReorder} style={styles.reorderButton}>
              <RefreshCw size={14} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.reorderText}>{t('reorder')}</Text>
            </Pressable>
          ) : (
            <ChevronRight size={20} color={Colors.textTertiary} strokeWidth={2} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  pressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    gap: 2,
  },
  orderId: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  date: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
  },
  itemsSummary: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  total: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  reorderText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.primary,
  },
});
