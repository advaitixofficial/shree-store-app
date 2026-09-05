// ============================================================
// Shree Stores - BannerCarousel Component (Redesigned)
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import type { Banner } from '@/types';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 150;

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const { language } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Banner>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
    if (index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => (item as any)._id || item.id}
        snapToInterval={BANNER_WIDTH + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const title = language === 'hi' ? item.titleHi : item.title;
          const subtitle = language === 'hi' ? item.subtitleHi : item.subtitle;

          // Helper to calculate gradient colors from banner's background color
          const gradientColors: [string, string] = [
            item.backgroundColor || Colors.primary,
            item.backgroundColor ? adjustColorBrightness(item.backgroundColor, -20) : Colors.primaryDark
          ];

          return (
            <Pressable style={styles.bannerWrapper}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
              >
                {/* Visual decorations */}
                <View style={[styles.decorationCircle, { backgroundColor: item.textColor || Colors.textWhite }]} />
                <View style={[styles.decorationCircleSmall, { backgroundColor: item.textColor || Colors.textWhite }]} />

                <View style={styles.bannerContent}>
                  <View style={styles.badge}>
                    <Sparkles size={12} color={item.backgroundColor} strokeWidth={2.5} />
                    <Text style={[styles.badgeText, { color: item.backgroundColor }]}>SPECIAL OFFER</Text>
                  </View>
                  <Text
                    style={[styles.bannerTitle, { color: item.textColor || Colors.textWhite }]}
                    numberOfLines={2}
                  >
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text
                      style={[styles.bannerSubtitle, { color: item.textColor || Colors.textWhite }]}
                      numberOfLines={1}
                    >
                      {subtitle}
                    </Text>
                  ) : null}
                  
                  <View style={styles.shopNowRow}>
                    <Text style={[styles.shopNowText, { color: item.textColor || Colors.textWhite }]}>Shop Now</Text>
                    <ArrowRight size={14} color={item.textColor || Colors.textWhite} strokeWidth={2.5} />
                  </View>
                </View>

                <View style={styles.bannerIconWrapper}>
                  <Sparkles size={72} color={item.textColor || Colors.textWhite} strokeWidth={1} opacity={0.15} />
                </View>
              </LinearGradient>
            </Pressable>
          );
        }}
      />

      {/* Dots */}
      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

// Simple color helper to darken/lighten Hex colors for gradients
function adjustColorBrightness(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return Colors.primaryDark;
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + (R * percent) / 100));
  G = Math.max(0, Math.min(255, G + (G * percent) / 100));
  B = Math.max(0, Math.min(255, B + (B * percent) / 100));

  const rHex = Math.round(R).toString(16).padStart(2, '0');
  const gHex = Math.round(G).toString(16).padStart(2, '0');
  const bHex = Math.round(B).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  bannerWrapper: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  banner: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    overflow: 'hidden',
  },
  decorationCircle: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.08,
  },
  decorationCircleSmall: {
    position: 'absolute',
    right: 100,
    bottom: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.04,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 6,
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    lineHeight: 24,
  },
  bannerSubtitle: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    lineHeight: 18,
    opacity: 0.85,
  },
  shopNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  shopNowText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
  },
  bannerIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 6,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 5,
    backgroundColor: Colors.border,
  },
});
