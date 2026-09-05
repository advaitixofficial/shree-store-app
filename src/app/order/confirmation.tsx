// ============================================================
// Shree Stores - Order Confirmation Screen (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/common/Button';
import { Check, Bike } from 'lucide-react-native';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orderId, orderNumber } = useLocalSearchParams<{ orderId: string, orderNumber?: string }>();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Circle */}
        <View style={styles.successCircle}>
          <Check size={48} color={Colors.primary} strokeWidth={3.5} />
        </View>

        <Text style={styles.title}>{t('orderPlaced')}</Text>
        <Text style={styles.subtitle}>{t('orderPlacedDesc')}</Text>

        {/* Order Info */}
        <View style={styles.orderInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('orderId')}</Text>
            <Text style={styles.infoValue}>{orderNumber || orderId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('estimatedDelivery')}</Text>
            <Text style={styles.infoValue}>30-45 {t('minutes')}</Text>
          </View>
        </View>

        {/* Delivery Banner */}
        <View style={styles.deliveryBanner}>
          <View style={styles.deliveryIconBg}>
            <Bike size={20} color={Colors.orangeDark} strokeWidth={2} />
          </View>
          <Text style={styles.deliveryText}>
            Our trusted store employee will deliver your order
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <Button
          title={t('viewOrder')}
          onPress={() => {
            router.replace(`/order/${orderId}`);
          }}
          fullWidth
          size="lg"
        />
        <Button
          title={t('continueShopping')}
          onPress={() => router.replace('/(tabs)')}
          variant="outline"
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.base,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  title: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primaryDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  orderInfoCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.orangeLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.15)',
  },
  deliveryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.orangeDark,
    lineHeight: 20,
  },
  footer: {
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
});
