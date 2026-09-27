// ============================================================
// Shree Stores - Profile Screen (Redesigned)
// ============================================================

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { useTranslation } from '@/i18n';
import { useAppStore } from '@/store';
import { ClipboardList, MapPin, Globe, Bell, HelpCircle, FileText, Shield, Info, LogOut, ChevronRight, User } from 'lucide-react-native';

interface ProfileMenuItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
  rightText?: string;
  danger?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { auth, logout, setLanguage } = useAppStore();

  const handleLogout = () => {
    Alert.alert(t('logout'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    await setLanguage(newLang);
  };

  const mainMenuItems: ProfileMenuItem[] = [
    { icon: <ClipboardList size={18} color={Colors.primary} strokeWidth={2} />, label: t('orderHistory'), onPress: () => router.push('/(tabs)/orders'), showArrow: true },
    { icon: <MapPin size={18} color={Colors.primary} strokeWidth={2} />, label: t('addresses'), onPress: () => router.push('/address'), showArrow: true },
    { icon: <Globe size={18} color={Colors.primary} strokeWidth={2} />, label: t('language'), onPress: handleLanguageToggle, rightText: language === 'en' ? 'English' : 'हिन्दी', showArrow: true },
    { icon: <Bell size={18} color={Colors.primary} strokeWidth={2} />, label: t('notifications'), onPress: () => router.push('/notifications'), showArrow: true },
  ];

  const supportMenuItems: ProfileMenuItem[] = [
    { icon: <HelpCircle size={18} color={Colors.textSecondary} strokeWidth={2} />, label: t('helpSupport'), onPress: () => router.push('/support'), showArrow: true },
    { icon: <FileText size={18} color={Colors.textSecondary} strokeWidth={2} />, label: t('termsConditions'), onPress: () => router.push('/terms'), showArrow: true },
    { icon: <Shield size={18} color={Colors.textSecondary} strokeWidth={2} />, label: t('privacyPolicy'), onPress: () => router.push('/terms'), showArrow: true },
    { icon: <Info size={18} color={Colors.textSecondary} strokeWidth={2} />, label: t('aboutUs'), onPress: () => {}, showArrow: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('myProfile')}</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <User size={28} color={Colors.textWhite} strokeWidth={2.5} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{auth.user?.firstName} {auth.user?.lastName}</Text>
            <Text style={styles.userPhone}>+91 {auth.user?.phone ?? ''}</Text>
            {auth.user?.email ? (
              <Text style={styles.userEmail}>{auth.user.email}</Text>
            ) : null}
          </View>
          <Pressable onPress={() => router.push('/auth/register')} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
            <Text style={styles.editText}>{t('edit')}</Text>
          </Pressable>
        </View>

        {/* Account Settings Section */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.menuSection}>
          {mainMenuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
                index === mainMenuItems.length - 1 && styles.lastMenuItem,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors.primaryLight }]}>
                  {item.icon}
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.rightText ? (
                  <Text style={styles.menuRightText}>{item.rightText}</Text>
                ) : null}
                {item.showArrow ? (
                  <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={2.5} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Help & Legal Section */}
        <Text style={styles.sectionTitle}>Help & Information</Text>
        <View style={styles.menuSection}>
          {supportMenuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuItem,
                pressed && styles.menuItemPressed,
                index === supportMenuItems.length - 1 && styles.lastMenuItem,
              ]}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: Colors.backgroundGrey }]}>
                  {item.icon}
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.showArrow ? (
                  <ChevronRight size={18} color={Colors.textTertiary} strokeWidth={2.5} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
        >
          <LogOut size={20} color={Colors.error} strokeWidth={2.2} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.logoTextMain}>SHREE STORES</Text>
          <Text style={styles.versionText}>{t('version')} 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.text,
  },
  userPhone: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  userEmail: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
  },
  editButton: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 6,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.primaryLight,
  },
  editText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primaryDark,
  },
  pressed: {
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textSecondary,
    marginLeft: Spacing.base,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuRightText: {
    fontSize: Typography.size.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primaryDark,
    fontWeight: Typography.weight.semibold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xl + 8,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  logoutButtonPressed: {
    backgroundColor: Colors.errorLight,
  },
  logoutText: {
    fontSize: Typography.size.base,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.error,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: Spacing['2xl'],
    gap: 4,
  },
  logoTextMain: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textTertiary,
    letterSpacing: 2,
  },
  versionText: {
    fontSize: Typography.size.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
  },
});
