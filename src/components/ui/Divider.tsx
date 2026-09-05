// ============================================================
// Shree Stores - Divider Component
// ============================================================

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/typography';

interface DividerProps {
  marginVertical?: number;
  color?: string;
  style?: ViewStyle;
}

export function Divider({
  marginVertical = Spacing.base,
  color = Colors.border,
  style,
}: DividerProps) {
  return (
    <View style={[styles.divider, { marginVertical, backgroundColor: color }, style]} />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
