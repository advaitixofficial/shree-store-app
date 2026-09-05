// ============================================================
// Shree Stores - Address Management Screen (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, Shadows, BorderRadius } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { AddressCard } from '@/components/AddressCard';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ArrowLeft, MapPin } from 'lucide-react-native';

export default function AddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { addresses, deleteAddress, setDefaultAddress } = useAppStore();

  const handleDelete = (id: string) => {
    Alert.alert(t('delete'), t('deleteAddressConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteAddress(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('myAddresses')}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={40} color={Colors.textSecondary} />}
          title={t('noAddresses')}
          subtitle={t('noAddressesDesc')}
          actionTitle={t('addAddress')}
          onAction={() => router.push('/address/add')}
        />
      ) : (
        <View style={styles.content}>
          <FlatList
            data={addresses}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <AddressCard
                address={item}
                selected={item.isDefault}
                onPress={async () => {
                  await setDefaultAddress(item._id);
                  if (router.canGoBack()) {
                    router.back();
                  }
                }}
                onEdit={() => router.push({ pathname: '/address/add', params: { id: item._id } })}
                onDelete={() => handleDelete(item._id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.base) }]}>
            <Button
              title={`+ ${t('addAddress')}`}
              onPress={() => router.push('/address/add')}
              variant="outline"
              fullWidth
              size="lg"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
  },
  backButtonPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  list: {
    padding: Spacing.base,
  },
  separator: {
    height: Spacing.sm,
  },
  footer: {
    padding: Spacing.base,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  pressed: {
    opacity: 0.7,
  },
});
