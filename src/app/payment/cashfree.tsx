// ============================================================
// Shree Stores - Cashfree Payment WebView Screen
// Opens Cashfree checkout in a WebView for online payment
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '@/constants/typography';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useAppStore } from '@/store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';

export default function CashfreePaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    paymentSessionId: string;
    cashfreeEnv: string;
    orderId: string;
    orderNumber: string;
    totalAmount: string;
  }>();
  
  const { auth, clearCart } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDone, setPaymentDone] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // Auto-hide the loading overlay after 3 seconds max
  // Cashfree's iframes cause onLoadEnd to fire unpredictably
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const cashfreeJsUrl = 'https://sdk.cashfree.com/js/v3/cashfree.js';

  // HTML that loads Cashfree JS SDK and opens checkout
  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: #333;
        }
        .loading {
          text-align: center;
          padding: 40px 20px;
        }
        .loading h3 {
          margin-bottom: 12px;
          font-size: 18px;
          color: #2E7D32;
        }
        .loading p {
          color: #666;
          font-size: 14px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top: 4px solid #2E7D32;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="loading" id="loader">
        <div class="spinner"></div>
        <h3>Processing Payment</h3>
        <p>Please wait while we open the payment page...</p>
      </div>

      <script src="${cashfreeJsUrl}"></script>
      <script>
        (function() {
          try {
            const cashfree = Cashfree({
              mode: "${params.cashfreeEnv === 'production' ? 'production' : 'sandbox'}"
            });

            cashfree.checkout({
              paymentSessionId: "${params.paymentSessionId}",
              redirectTarget: "_self"
            }).then(function(result) {
              if (result.error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_ERROR',
                  error: result.error.message || 'Payment failed'
                }));
              }
              if (result.paymentDetails) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_SUCCESS',
                  details: result.paymentDetails
                }));
              }
            }).catch(function(err) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_ERROR',
                error: err.message || 'Something went wrong'
              }));
            });
          } catch(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_ERROR',
              error: e.message || 'Failed to initialize payment'
            }));
          }
        })();
      </script>
    </body>
    </html>
  `;

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'PAYMENT_SUCCESS') {
        setPaymentDone(true);
        // Verify payment on backend
        await verifyPayment();
      } else if (data.type === 'PAYMENT_ERROR') {
        Alert.alert('Payment Failed', data.error || 'Payment could not be completed', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/orders') }
        ]);
      }
    } catch {
      // Ignore non-JSON messages
    }
  };

  const verifyPayment = async () => {
    try {
      const token = auth.token;
      const response = await fetch(`${API_URL}/customer/payments/verify/${params.orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (result.data?.paymentStatus === 'PAID') {
        await clearCart();
        router.replace({
          pathname: '/order/confirmation',
          params: { orderId: params.orderId, orderNumber: params.orderNumber },
        });
      } else {
        // Payment may still be processing — check status
        Alert.alert(
          'Payment Processing',
          'Your payment is being processed. You will receive a notification once confirmed.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/orders') }]
        );
      }
    } catch {
      Alert.alert(
        'Verification Pending',
        'We could not verify your payment right now. Please check your order status.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/orders') }]
      );
    }
  };

  // Handle URL changes to detect payment completion
  const handleNavigationChange = (navState: any) => {
    const url = navState.url || '';
    
    // Cashfree redirects back after payment — detect common patterns
    if (url.includes('/orders/') && url.includes('/status')) {
      // Payment flow completed, verify
      if (!paymentDone) {
        setPaymentDone(true);
        verifyPayment();
      }
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment? Your order will be saved but payment will be pending.',
      [
        { text: 'Continue Payment', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => router.replace('/(tabs)/orders') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <ShieldCheck size={18} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.headerTitle}>Secure Payment</Text>
        </View>
        <Text style={styles.headerAmount}>₹{params.totalAmount}</Text>
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: checkoutHtml }}
        style={styles.webView}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationChange}
        onLoadEnd={() => setIsLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsInlineMediaPlayback={true}
        cacheEnabled={true}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}
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
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    ...Shadows.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.semibold,
    fontWeight: Typography.weight.semibold,
    color: Colors.text,
  },
  headerAmount: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: Typography.weight.bold,
    color: Colors.primaryDark,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill as any,
    top: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
});
