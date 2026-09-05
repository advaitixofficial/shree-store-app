// ============================================================
// Shree Stores - OTP Verification Screen (Redesigned)
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { Button } from '@/components/common/Button';
import { ArrowLeft } from 'lucide-react-native';
import { authApi } from '@/api/auth';
import { Alert } from 'react-native';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { t } = useTranslation();
  const { login } = useAppStore();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) return;
    setLoading(true);
    try {
      const response = await authApi.verifyOtp(phone ?? '', otpString);
      if (response.isNewUser && response.registrationToken) {
        router.replace({ pathname: '/auth/register', params: { phone, registrationToken: response.registrationToken } });
      } else if (!response.isNewUser && response.tokenPair && response.user) {
        await login(response.user, response.tokenPair);
        router.replace('/(tabs)');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await authApi.sendOtp(phone ?? '');
      setTimer(30);
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const otpFilled = otp.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back Button */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t('otpTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('otpSubtitle')} +91 {phone}
          </Text>

          {/* OTP Inputs */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  focusedIndex === index && styles.otpInputFocused,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text.replace(/[^0-9]/g, ''), index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={1}
                selectionColor={Colors.primary}
              />
            ))}
          </View>

          {/* Resend */}
          <View style={styles.resendRow}>
            {timer > 0 ? (
              <Text style={styles.resendTimer}>
                {t('resendIn')} <Text style={styles.timerBold}>{timer}</Text> {t('seconds')}
              </Text>
            ) : (
              <Pressable onPress={handleResend} style={({ pressed }) => pressed && styles.pressed}>
                <Text style={styles.resendLink}>{t('resendOtp')}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
          <Button
            title={t('verifyOtp')}
            onPress={handleVerify}
            fullWidth
            size="lg"
            loading={loading}
            disabled={!otpFilled}
          />
        </View>
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
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.size['3xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    textAlign: 'center',
    fontSize: Typography.size.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
    backgroundColor: Colors.backgroundSecondary,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  otpInputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.background,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendTimer: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  timerBold: {
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  resendLink: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary,
    fontWeight: Typography.weight.semibold,
  },
  footer: {
    padding: Spacing.xl,
  },
});
