// ============================================================
// Shree Stores - Splash / Entry Point (Redesigned)
// Routes to the correct screen based on app state.
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from '@/store';
import { Colors } from '@/constants/colors';
import { Typography, Spacing } from '@/constants/typography';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

export default function SplashEntry() {
  const router = useRouter();
  const { isAppReady, language, isOnboarded, auth } = useAppStore();

  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Start entry animations (only fade in the tagline, logo should already be visible to match native splash)
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
  }, []);

  useEffect(() => {
    if (!isAppReady) return;

    // Hide native splash screen
    SplashScreen.hideAsync().catch(() => {});

    // Determine navigation target and navigate after animations finish
    const timer = setTimeout(() => {
      // Scale down a bit before routing for exit transition effect
      logoScale.value = withTiming(0.95, { duration: 300 });
      logoOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(routeUser)();
        }
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [isAppReady]);

  const routeUser = () => {
    if (!isOnboarded) {
      router.replace('/onboarding/language');
    } else if (!auth.isAuthenticated) {
      router.replace('/auth/login');
    } else {
      router.replace('/(tabs)');
    }
  };

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <Image 
            source={require('../../assets/images/shree-stores-logo-v2.png')} 
            style={{ width: 200, height: 200 }} 
            resizeMode="contain" 
          />
        </Animated.View>
        <Animated.View style={animatedTaglineStyle}>
          <Text style={styles.tagline}>Sab Kuch, Abhi Ke Abhi</Text>
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <View style={styles.accentLine}>
          <View style={[styles.lineSegment, { backgroundColor: Colors.primary }]} />
          <View style={[styles.lineSegment, { backgroundColor: Colors.orange }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: Spacing.xl,
  },
  sparkleIcon: {
    position: 'absolute',
    top: 0,
    right: 20,
  },
  logoTextMain: {
    fontSize: 48,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    letterSpacing: 2,
    lineHeight: 48,
  },
  logoTextSub: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.orange,
    letterSpacing: 8,
    lineHeight: 24,
    marginTop: 4,
    paddingLeft: 8,
  },
  tagline: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  footer: {
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  accentLine: {
    flexDirection: 'row',
    gap: 6,
  },
  lineSegment: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
