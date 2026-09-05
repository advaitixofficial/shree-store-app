import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { Search } from 'lucide-react-native';

export function HomeSearchBar() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => router.push('/search')}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <Search size={22} color={Colors.primary} strokeWidth={2.5} />
      <Text style={styles.placeholder}>{t('searchGroceries')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  pressed: {
    backgroundColor: Colors.backgroundGrey,
    transform: [{ scale: 0.99 }],
  },
  placeholder: {
    flex: 1,
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.textTertiary,
  },
});
