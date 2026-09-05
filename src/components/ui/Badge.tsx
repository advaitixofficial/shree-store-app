// ============================================================
// Shree Stores - Badge Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing } from '@/constants/typography';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'orange' | 'neutral';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.successLight, text: Colors.success },
  warning: { bg: Colors.warningLight, text: '#92400E' },
  error: { bg: Colors.errorLight, text: Colors.error },
  info: { bg: Colors.infoLight, text: Colors.info },
  orange: { bg: Colors.orangeLight, text: Colors.orangeDark },
  neutral: { bg: Colors.backgroundGrey, text: Colors.textSecondary },
};

export function Badge({ text, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];
  const isSm = size === 'sm';

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.bg },
      isSm ? styles.sm : styles.md,
    ]}>
      <Text style={[
        styles.text,
        { color: colors.text },
        isSm ? styles.textSm : styles.textMd,
      ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
  },
  textSm: {
    fontSize: Typography.size.xs,
  },
  textMd: {
    fontSize: Typography.size.sm,
  },
});
