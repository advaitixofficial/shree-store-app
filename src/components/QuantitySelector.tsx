// ============================================================
// Shree Stores - QuantitySelector Component (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing } from '@/constants/typography';
import { Plus, Minus } from 'lucide-react-native';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'sm' | 'md';
  maxQuantity?: number;
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  size = 'md',
  maxQuantity = 10,
}: QuantitySelectorProps) {
  const isSm = size === 'sm';
  const iconSize = isSm ? 14 : 16;
  const btnSize = isSm ? 32 : 36;

  return (
    <View style={[styles.container, isSm && styles.containerSm]}>
      <Pressable
        onPress={onDecrease}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [
          styles.button,
          { width: btnSize, height: btnSize },
          pressed && styles.buttonPressed,
        ]}
        accessibilityLabel="Decrease quantity"
      >
        <Minus size={iconSize} color={Colors.textWhite} strokeWidth={2.5} />
      </Pressable>
      <View style={[styles.quantityWrapper, isSm && styles.quantityWrapperSm]}>
        <Text style={[styles.quantity, isSm && styles.quantitySm]}>{quantity}</Text>
      </View>
      <Pressable
        onPress={onIncrease}
        disabled={quantity >= maxQuantity}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => [
          styles.button,
          { width: btnSize, height: btnSize },
          pressed && styles.buttonPressed,
          quantity >= maxQuantity && styles.buttonDisabled,
        ]}
        accessibilityLabel="Increase quantity"
      >
        <Plus size={iconSize} color={Colors.textWhite} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  containerSm: {
    borderRadius: 6,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  quantityWrapper: {
    minWidth: 32,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityWrapperSm: {
    minWidth: 24,
    height: 32,
  },
  quantity: {
    color: Colors.textWhite,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  quantitySm: {
    fontSize: Typography.size.sm,
  },
});
