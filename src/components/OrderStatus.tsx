// ============================================================
// Shree Stores - OrderStatus Timeline Component (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import type { OrderStatus as OrderStatusType } from '@/types';
import { Check, X, Clock, Package, Truck, Smile, Store, ThumbsUp } from 'lucide-react-native';

interface OrderStatusProps {
  currentStatus: OrderStatusType;
}

const STATUSES: OrderStatusType[] = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function OrderStatusTimeline({ currentStatus }: OrderStatusProps) {
  const { t } = useTranslation();

  const getStatusLabel = (status: OrderStatusType): string => {
    const map: Record<OrderStatusType, string> = {
      PLACED: t('orderStatusPlaced'),
      ACCEPTED: t('orderStatusAccepted'),
      REJECTED: t('orderStatusCancelled'),
      PREPARING: t('orderStatusPreparing'),
      READY: t('orderStatusReady'),
      OUT_FOR_DELIVERY: t('orderStatusOutForDelivery'),
      DELIVERED: t('orderStatusDelivered'),
      CANCELLED: t('orderStatusCancelled'),
    };
    return map[status] || status;
  };

  const getStatusIcon = (status: OrderStatusType, isCompleted: boolean) => {
    const color = isCompleted ? Colors.textWhite : Colors.textTertiary;
    const size = 14;
    switch (status) {
      case 'PLACED':
        return <Clock size={size} color={color} />;
      case 'ACCEPTED':
        return <ThumbsUp size={size} color={color} />;
      case 'PREPARING':
        return <Store size={size} color={color} />;
      case 'READY':
        return <Package size={size} color={color} />;
      case 'OUT_FOR_DELIVERY':
        return <Truck size={size} color={color} />;
      case 'DELIVERED':
        return <Smile size={size} color={color} />;
      default:
        return <Check size={size} color={color} />;
    }
  };

  if (currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') {
    return (
      <View style={styles.cancelledContainer}>
        <View style={styles.cancelledCircle}>
          <X size={32} color={Colors.error} strokeWidth={2.5} />
        </View>
        <Text style={styles.cancelledText}>{t('orderStatusCancelled')}</Text>
      </View>
    );
  }

  const currentIndex = STATUSES.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {STATUSES.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === STATUSES.length - 1;

        return (
          <View key={status} style={styles.step}>
            <View style={styles.stepIndicator}>
              {/* Dot */}
              <View
                style={[
                  styles.dot,
                  isCompleted ? styles.dotCompleted : styles.dotPending,
                  isCurrent && styles.dotCurrent,
                ]}
              >
                {isCompleted && !isCurrent ? (
                  <Check size={10} color={Colors.textWhite} strokeWidth={3} />
                ) : (
                  getStatusIcon(status, isCompleted || isCurrent)
                )}
              </View>
              {/* Line */}
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    isCompleted && index < currentIndex
                      ? styles.lineCompleted
                      : styles.linePending,
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.stepContent}>
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted ? styles.stepLabelActive : styles.stepLabelInactive,
                  isCurrent && styles.stepLabelCurrent,
                ]}
              >
                {getStatusLabel(status)}
              </Text>
              {isCurrent && (
                <Text style={styles.currentStatusBadge}>
                  Active Stage
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    minHeight: 60,
  },
  stepIndicator: {
    width: 32,
    alignItems: 'center',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
  },
  dotPending: {
    backgroundColor: Colors.border,
  },
  dotCurrent: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: Colors.primaryLight,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 30,
  },
  lineCompleted: {
    backgroundColor: Colors.primary,
  },
  linePending: {
    backgroundColor: Colors.border,
  },
  stepContent: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.base,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
  },
  stepLabelActive: {
    color: Colors.text,
  },
  stepLabelInactive: {
    color: Colors.textTertiary,
  },
  stepLabelCurrent: {
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primaryDark,
  },
  currentStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    color: Colors.primaryDark,
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.semibold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: 4,
  },
  cancelledContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  cancelledCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelledText: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.error,
  },
});
