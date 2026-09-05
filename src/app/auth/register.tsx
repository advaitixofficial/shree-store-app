// ============================================================
// Shree Stores - Registration / Profile Screen (Redesigned)
// ============================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { User } from 'lucide-react-native';

import { authApi } from '@/api/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, registrationToken } = useLocalSearchParams<{ phone: string; registrationToken: string }>();
  const { t } = useTranslation();
  const { login } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [loading, setLoading] = useState(false);

  // Security check: if user navigated here without a token, bump them to login
  React.useEffect(() => {
    if (!registrationToken) {
      Alert.alert('Unauthorized', 'Please verify your phone number first.');
      router.replace('/auth/login');
    }
  }, [registrationToken]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrors({ name: t('nameRequired') });
      return;
    }
    setErrors({});
    setLoading(true);
    
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'User';

      const response = await authApi.register({
        firstName,
        lastName,
        registrationToken: registrationToken ?? '',
        email: email.trim() || undefined,
        preferredLanguage: 'en',
      });

      await login(response.user, response.tokenPair);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to register');
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <User size={40} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.title}>{t('registerTitle')}</Text>
            <Text style={styles.subtitle}>{t('registerSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('fullName')}
              placeholder={t('enterName')}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({});
              }}
              error={errors.name}
              autoCapitalize="words"
            />
            <Input
              label={t('emailOptional')}
              placeholder={t('enterEmail')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.xl) }]}>
          <Button
            title={t('createAccount')}
            onPress={handleSubmit}
            fullWidth
            size="lg"
            loading={loading}
            disabled={!name.trim()}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  title: {
    fontSize: Typography.size['2xl'],
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
  form: {
    gap: Spacing.lg,
  },
  footer: {
    padding: Spacing.xl,
  },
});
