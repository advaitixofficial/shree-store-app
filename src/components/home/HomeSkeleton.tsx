import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/typography';

function ShimmerBlock({ width, height, style, borderRadius = BorderRadius.sm }: any) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Search Bar Skeleton */}
      <View style={{ paddingHorizontal: Spacing.base, marginVertical: Spacing.sm }}>
        <ShimmerBlock width="100%" height={48} borderRadius={BorderRadius.lg} />
      </View>

      {/* Categories Skeleton */}
      <View style={styles.section}>
        <View style={styles.categoryRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={styles.categoryItem}>
              <ShimmerBlock width={64} height={64} borderRadius={BorderRadius.lg} />
              <ShimmerBlock width={50} height={12} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </View>

      {/* Banner Skeleton */}
      <View style={styles.section}>
        <ShimmerBlock width="92%" height={160} borderRadius={BorderRadius.lg} style={{ alignSelf: 'center' }} />
      </View>

      {/* Products Skeleton */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ShimmerBlock width={120} height={20} />
          <ShimmerBlock width={60} height={16} />
        </View>
        <View style={styles.productRow}>
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} width={125} height={180} borderRadius={BorderRadius.md} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  shimmer: {
    backgroundColor: Colors.shimmer,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
  },
  productRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 12,
  },
});
