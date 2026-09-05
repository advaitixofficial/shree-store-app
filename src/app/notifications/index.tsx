import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { notificationApi } from '../../api/notifications';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius as Radius } from '@/constants/typography';
import { Bell, Package, CheckCircle, Info, ArrowLeft, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      setError(null);
      const res = await notificationApi.getNotifications({ limit: 50 });
      if (res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(true);
  }, []);

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (e) {
      console.warn('Failed to mark notification as read', e);
    }
  };

  const clearAll = async () => {
    try {
      await notificationApi.clearAll();
      setNotifications([]);
    } catch (e) {
      console.warn('Failed to clear notifications', e);
    }
  };

  const getIcon = (type: string) => {
    if (type.startsWith('ORDER')) return <Package size={24} color={Colors.primary} />;
    if (type === 'MARKETING_BROADCAST') return <Bell size={24} color={Colors.warning} />;
    return <Info size={24} color={Colors.info} />;
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, !item.isRead && styles.unreadCard]}
      onPress={() => {
        markAsRead(item._id, item.isRead);
        if (item.data?.orderId) {
          router.push(`/order/${item.data.orderId}`);
        }
      }}
    >
      <View style={styles.iconBox}>
        {getIcon(item.type)}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={clearAll} style={styles.readAllButton}>
          <Text style={styles.readAllText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyMessage}>We'll notify you when something arrives.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: { padding: Spacing.xs },
  headerTitle: { fontSize: Typography.size.lg, fontWeight: 'bold', color: Colors.text, flex: 1, marginLeft: Spacing.sm },
  readAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.xs },
  readAllText: { fontSize: Typography.size.sm, color: Colors.primary, fontWeight: '600' },
  listContent: { flexGrow: 1, paddingBottom: Spacing.xl },
  card: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  unreadCard: {
    backgroundColor: Colors.primary + '0A',
  },
  iconBox: { width: 48, height: 48, borderRadius: Radius.full, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  info: { flex: 1 },
  title: { fontSize: Typography.size.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  unreadText: { fontWeight: 'bold' },
  message: { fontSize: Typography.size.sm, color: Colors.text, marginBottom: Spacing.sm },
  time: { fontSize: Typography.size.xs, color: Colors.textTertiary },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: Spacing.sm },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: Typography.size.md, fontWeight: 'bold', color: Colors.text, marginTop: Spacing.md },
  emptyMessage: { fontSize: Typography.size.sm, color: Colors.textTertiary, marginTop: Spacing.xs },
});
