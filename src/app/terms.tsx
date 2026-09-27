import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Typography, Spacing } from '@/constants/typography';
import { useTranslation } from '@/i18n';

export default function TermsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('termsConditions') || 'Terms & Conditions'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.text}>
          Welcome to ShreeStores. By using our app, you agree to the following terms and conditions.
        </Text>

        <Text style={styles.heading}>1. Use of App</Text>
        <Text style={styles.text}>
          You agree to use the app only for lawful purposes and in accordance with these terms.
        </Text>

        <Text style={styles.heading}>2. Orders</Text>
        <Text style={styles.text}>
          • All orders are subject to availability.{'\n'}
          • We reserve the right to cancel or refuse any order at our discretion.
        </Text>

        <Text style={styles.heading}>3. Pricing</Text>
        <Text style={styles.text}>
          • Prices listed in the app are subject to change without prior notice.{'\n'}
          • We try to ensure all prices are accurate, but errors may occur.
        </Text>

        <Text style={styles.heading}>4. Payments</Text>
        <Text style={styles.text}>
          • Payments (if applicable) will be processed via third-party payment providers.{'\n'}
          • We are not responsible for payment failures caused by external services.
        </Text>

        <Text style={styles.heading}>5. Delivery</Text>
        <Text style={styles.text}>
          • Delivery timelines are estimates and may vary.{'\n'}
          • We are not liable for delays due to unforeseen circumstances.
        </Text>

        <Text style={styles.heading}>6. Returns & Refunds</Text>
        <Text style={styles.text}>
          • Return/refund policies will be communicated as per product/service.
        </Text>

        <Text style={styles.heading}>7. Limitation of Liability</Text>
        <Text style={styles.text}>
          We are not liable for any indirect or incidental damages arising from the use of our app.
        </Text>

        <Text style={styles.heading}>8. Changes to Terms</Text>
        <Text style={styles.text}>
          We may update these terms at any time. Continued use of the app means you accept the updated terms.
        </Text>

        <Text style={styles.heading}>9. Contact</Text>
        <Text style={styles.text}>
          For any questions, contact:{'\n'}
          shreestoresandpackaging@gmail.com
        </Text>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  heading: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  text: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  }
});
