// ============================================================
// Shree Stores - Login Screen (Redesigned)
// ============================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Sparkles } from 'lucide-react-native';
import { authApi } from '@/api/auth';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setError(t('invalidMobile'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.sendOtp(phone);
      router.push({ pathname: '/auth/otp', params: { phone } });
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Logo & Title */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/shree-stores-logo-v2.png')} 
                  style={styles.logoImage} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={styles.title}>{t('loginTitle')}</Text>
              <Text style={styles.subtitle}>{t('loginSubtitle')}</Text>
            </View>

            {/* Input */}
            <View style={styles.inputSection}>
              <Input
                label={t('mobileNumber')}
                placeholder={t('enterMobile')}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                  if (error) setError('');
                }}
                keyboardType="phone-pad"
                maxLength={10}
                error={error}
                leftIcon={
                  <View style={styles.countryCode}>
                    <Text style={styles.flag}>🇮🇳</Text>
                    <Text style={styles.code}>+91</Text>
                  </View>
                }
              />
            </View>
          </View>

          {/* Button */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
            <Button
              title={t('sendOtp')}
              onPress={handleSendOtp}
              fullWidth
              size="lg"
              loading={loading}
              disabled={phone.length < 10}
            />
            <Text style={styles.terms}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  logoImage: {
    width: 200,
    height: 80,
  },
  title: {
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputSection: {
    gap: Spacing.base,
    marginTop: Spacing.lg,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: Spacing.sm,
    borderRightWidth: 1.5,
    borderRightColor: Colors.border,
  },
  flag: {
    fontSize: 16,
  },
  code: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  footer: {
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  terms: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
