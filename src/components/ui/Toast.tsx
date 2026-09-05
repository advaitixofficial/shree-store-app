// ============================================================
// Shree Stores - Toast Notification System
// ============================================================

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing } from '@/constants/typography';
import { Check, ShoppingCart, Trash2, AlertCircle, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info' | 'cart';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const ICON_MAP: Record<ToastType, React.ReactElement> = {
  success: <Check size={18} color={Colors.textWhite} strokeWidth={2.5} />,
  error: <AlertCircle size={18} color={Colors.textWhite} strokeWidth={2} />,
  info: <AlertCircle size={18} color={Colors.textWhite} strokeWidth={2} />,
  cart: <ShoppingCart size={18} color={Colors.textWhite} strokeWidth={2} />,
};

const BG_MAP: Record<ToastType, string> = {
  success: Colors.primary,
  error: Colors.error,
  info: Colors.text,
  cart: Colors.primary,
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto dismiss after 2.5s
    translateY.value = withDelay(
      2500,
      withTiming(-80, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onDismiss)();
      }),
    );
    opacity.value = withDelay(2500, withTiming(0, { duration: 200 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: BG_MAP[toast.type] },
        animatedStyle,
      ]}
    >
      {ICON_MAP[toast.type]}
      <Text style={styles.toastText} numberOfLines={2}>{toast.message}</Text>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const idCounter = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++idCounter.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 9999,
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  toastText: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: Typography.weight.medium,
  },
});
