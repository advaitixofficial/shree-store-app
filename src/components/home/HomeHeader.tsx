import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { MapPin, User, ChevronDown } from 'lucide-react-native';

export function HomeHeader() {
  const router = useRouter();
  const { t } = useTranslation();
  const { addresses, auth } = useAppStore();

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  return (
    <View style={styles.header}>
      {/* Location Section */}
      <View style={styles.locationContainer}>
        <View style={styles.brandRow}>
          <MapPin size={18} color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.brandText}>{t('deliverTo')}</Text>
        </View>
        <Pressable onPress={() => router.push('/address')} style={styles.addressRow}>
          <Text style={styles.addressText} numberOfLines={1}>
            {defaultAddress
              ? `${defaultAddress.addressLine1}, ${defaultAddress.city}`
              : t('selectAddress')}
          </Text>
          <ChevronDown size={16} color={Colors.textSecondary} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Profile Section */}
      <Pressable 
        onPress={() => router.push('/(tabs)/profile')}
        style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
      >
        {auth.user?.profileImage?.url ? (
          <View style={styles.avatarImage} /> // Replace with real image if needed
        ) : (
          <User size={22} color={Colors.textWhite} strokeWidth={2} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  locationContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  brandText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryDark,
  },
  pressed: {
    opacity: 0.8,
  },
});
