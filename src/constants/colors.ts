// ============================================================
// Shree Stores - Brand Colors
// Premium Design System
// ============================================================

export const Colors = {
  // Primary Brand Colors
  primary: '#2E7D32',
  primaryDark: '#145A32',
  primaryLight: '#E8F5E9',
  primaryGlow: 'rgba(46, 125, 50, 0.12)',
  primaryMuted: 'rgba(46, 125, 50, 0.08)',

  // Accent Colors
  orange: '#F57C00',
  orangeLight: '#FFF3E0',
  orangeDark: '#E65100',
  orangeGlow: 'rgba(245, 124, 0, 0.12)',

  // Backgrounds
  background: '#FAFAFA',
  backgroundSecondary: '#FFFFFF',
  backgroundGrey: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textWhite: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // Status
  success: '#2E7D32',
  successLight: '#E8F5E9',
  error: '#EF4444',
  errorLight: '#FEF2F2',
  warning: '#F57C00',
  warningLight: '#FFF3E0',
  info: '#3B82F6',
  infoLight: '#EFF6FF',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.06)',
  shadowStrong: 'rgba(0, 0, 0, 0.10)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Misc
  star: '#F59E0B',
  discount: '#EF4444',
  badge: '#EF4444',
  skeleton: '#E5E7EB',
  shimmer: '#F3F4F6',
} as const;

export type ColorKey = keyof typeof Colors;
