// ============================================================
// Shree Stores - AddressCard Component (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import type { Address } from '@/types';
import { Home, Briefcase, MapPin, Pencil, Trash2 } from 'lucide-react-native';

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AddressCard({
  address,
  selected = false,
  onPress,
  onEdit,
  onDelete,
}: AddressCardProps) {
  const { t } = useTranslation();

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'HOME': return t('addressHome');
      case 'WORK': return t('addressWork');
      default: return t('addressOther');
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 16, color: selected ? Colors.primary : Colors.textSecondary, strokeWidth: 2.2 };
    switch (type) {
      case 'HOME': return <Home {...iconProps} />;
      case 'WORK': return <Briefcase {...iconProps} />;
      default: return <MapPin {...iconProps} />;
    }
  };

  const fullAddress = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.postalCode,
  ].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, selected && styles.selected]}
    >
      <View style={styles.header}>
        <View style={styles.typeWrapper}>
          <View style={[styles.iconWrapper, selected && styles.iconWrapperSelected]}>
            {getTypeIcon(address.label)}
          </View>
          <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
            {getTypeLabel(address.label)}
          </Text>
          {address.isDefault ? (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          {onEdit ? (
            <Pressable onPress={onEdit} style={styles.actionButton}>
              <Pencil size={14} color={Colors.textSecondary} strokeWidth={2.2} />
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable onPress={onDelete} style={[styles.actionButton, styles.deleteActionButton]}>
              <Trash2 size={14} color={Colors.error} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{address.fullName}</Text>
        <Text style={styles.address} numberOfLines={3}>{fullAddress}</Text>
        <Text style={styles.phone}>{address.phone}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    gap: 8,
    ...Shadows.sm,
    marginBottom: Spacing.xs,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperSelected: {
    backgroundColor: Colors.surface,
  },
  typeLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  typeLabelSelected: {
    color: Colors.primaryDark,
  },
  defaultBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginLeft: 4,
  },
  defaultText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionButton: {
    backgroundColor: Colors.errorLight,
  },
  body: {
    marginLeft: 40,
    gap: 4,
  },
  name: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text,
  },
  address: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  phone: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
    marginTop: 2,
  },
});
