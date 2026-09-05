// ============================================================
// Shree Stores - Onboarding Screen (Redesigned)
// ============================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { Button } from '@/components/common/Button';
import { ShoppingBag, Zap, HeartHandshake } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  titleKey: 'onboarding1Title' | 'onboarding2Title' | 'onboarding3Title';
  descKey: 'onboarding1Desc' | 'onboarding2Desc' | 'onboarding3Desc';
  color: string;
  iconColor: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { setOnboarded } = useAppStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  const slides: OnboardingSlide[] = [
    { id: '1', icon: <ShoppingBag size={72} color={Colors.primary} strokeWidth={1.5} />, titleKey: 'onboarding1Title', descKey: 'onboarding1Desc', color: Colors.primaryLight, iconColor: Colors.primary },
    { id: '2', icon: <Zap size={72} color={Colors.orange} strokeWidth={1.5} />, titleKey: 'onboarding2Title', descKey: 'onboarding2Desc', color: Colors.orangeLight, iconColor: Colors.orange },
    { id: '3', icon: <HeartHandshake size={72} color={Colors.info} strokeWidth={1.5} />, titleKey: 'onboarding3Title', descKey: 'onboarding3Desc', color: Colors.infoLight, iconColor: Colors.info },
  ];

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    await setOnboarded();
    router.replace('/auth/login');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const isLastSlide = activeIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <View style={styles.header}>
        {!isLastSlide ? (
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>{t('skip')}</Text>
          </Pressable>
        ) : (
          <View style={{ height: 40 }} />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <View style={[styles.blob, { backgroundColor: item.color }]} />
              <View style={styles.iconWrapper}>
                {item.icon}
              </View>
            </View>
            <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
            <Text style={styles.slideDesc}>{t(item.descKey)}</Text>
          </View>
        )}
      />

      {/* Dots & Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Button
          title={isLastSlide ? t('getStarted') : t('next')}
          onPress={handleNext}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    height: 44,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.textSecondary,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.xl,
  },
  iconContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
    position: 'relative',
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.8,
  },
  iconWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    zIndex: 2,
  },
  slideTitle: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  slideDesc: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.border,
  },
});
