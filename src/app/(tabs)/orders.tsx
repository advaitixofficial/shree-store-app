// ============================================================
// Shree Stores - Orders Screen (Redesigned)
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { orderApi } from '@/api/orders';
import { Order } from '@/types';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ClipboardList } from 'lucide-react-native';

type TabType = 'active' | 'past';

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getOrders(1, 100);
      setOrders(res.orders);
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const activeOrders = orders.filter(
    (o) => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)
  );
  const pastOrders = orders.filter((o) =>
    ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.orderStatus)
  );

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('orders')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          <Pressable
            onPress={() => setActiveTab('active')}
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              {t('activeOrders')} ({activeOrders.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('past')}
            style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
              {t('pastOrders')} ({pastOrders.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 100 }} />
      ) : displayOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={40} color={Colors.textSecondary} />}
          title={t('noOrders')}
          subtitle={t('noOrdersDesc')}
          actionTitle={t('startShopping')}
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={displayOrders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/order/${item._id}`)}
              onReorder={item.orderStatus === 'DELIVERED' ? () => {} : undefined}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  tabsContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    padding: 4,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  separator: {
    height: Spacing.md,
  },
});
