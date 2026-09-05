// ============================================================
// Shree Stores - Language Selection Screen (Redesigned)
// ============================================================

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useAppStore } from '@/store';
import { Button } from '@/components/common/Button';
import type { Language } from '@/types';
import { Check, Sparkles } from 'lucide-react-native';

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setLanguage } = useAppStore();
  const [selected, setSelected] = useState<Language>('en');

  const handleContinue = async () => {
    await setLanguage(selected);
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Decorative elements */}
        <View style={styles.headerDecoration}>
          <Sparkles size={56} color={Colors.primaryLight} strokeWidth={1.5} />
        </View>

        {/* Logo Text (Redesigned matching Splash) */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/shree-stores-logo-v2.png')} 
            style={{ width: 140, height: 140 }} 
            resizeMode="contain" 
          />
        </View>

        {/* Title */}
        <View style={styles.titleWrapper}>
          <Text style={styles.titleEn}>Choose your language</Text>
          <Text style={styles.titleHi}>अपनी भाषा चुनें</Text>
        </View>

        {/* Language Options */}
        <View style={styles.options}>
          <Pressable
            onPress={() => setSelected('en')}
            style={[
              styles.option,
              selected === 'en' && styles.optionSelected,
            ]}
          >
            <View style={[styles.radioOuter, selected === 'en' && styles.radioOuterSelected]}>
              {selected === 'en' ? <Check size={14} color={Colors.textWhite} strokeWidth={3} /> : null}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>English</Text>
              <Text style={styles.optionSub}>Continue in English</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setSelected('hi')}
            style={[
              styles.option,
              selected === 'hi' && styles.optionSelected,
            ]}
          >
            <View style={[styles.radioOuter, selected === 'hi' && styles.radioOuterSelected]}>
              {selected === 'hi' ? <Check size={14} color={Colors.textWhite} strokeWidth={3} /> : null}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>हिन्दी</Text>
              <Text style={styles.optionSub}>हिन्दी में जारी रखें</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Continue Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
        <Button
          title={selected === 'hi' ? 'जारी रखें' : 'Continue'}
          onPress={handleContinue}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['3xl'],
  },
  headerDecoration: {
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoTextMain: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    letterSpacing: 2,
    lineHeight: 32,
  },
  logoTextSub: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.orange,
    letterSpacing: 6,
    lineHeight: 16,
    marginTop: 2,
    paddingLeft: 4,
  },
  titleWrapper: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    gap: 6,
  },
  titleEn: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  titleHi: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  options: {
    width: '100%',
    gap: Spacing.base,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    gap: Spacing.base,
    ...Shadows.sm,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionContent: {
    gap: 2,
  },
  optionLabel: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  optionSub: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
});
