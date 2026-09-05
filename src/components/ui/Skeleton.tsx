// ============================================================
// Shree Stores - Skeleton Shimmer Component
// ============================================================

import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

// ── Preset Skeletons ─────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <Skeleton width={155} height={120} borderRadius={12} />
      <View style={styles.productCardContent}>
        <Skeleton width={120} height={14} />
        <Skeleton width={60} height={10} />
        <Skeleton width={80} height={14} />
        <Skeleton width={72} height={32} borderRadius={8} />
      </View>
    </View>
  );
}

export function CategoryCardSkeleton() {
  return (
    <View style={styles.categoryCard}>
      <Skeleton width={64} height={64} borderRadius={32} />
      <Skeleton width={56} height={10} />
    </View>
  );
}

export function BannerSkeleton() {
  return <Skeleton width="100%" height={160} borderRadius={16} />;
}

export function OrderCardSkeleton() {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardRow}>
        <Skeleton width={100} height={14} />
        <Skeleton width={72} height={24} borderRadius={12} />
      </View>
      <Skeleton width={80} height={12} />
      <View style={styles.orderCardRow}>
        <Skeleton width={60} height={16} />
        <Skeleton width={80} height={32} borderRadius={8} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.skeleton,
  },
  productCard: {
    width: 155,
    gap: 8,
    marginVertical: 4,
  },
  productCardContent: {
    gap: 6,
    paddingHorizontal: 8,
  },
  categoryCard: {
    alignItems: 'center',
    width: 80,
    gap: 8,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  orderCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
