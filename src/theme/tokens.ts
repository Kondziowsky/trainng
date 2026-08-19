import { Platform } from 'react-native';

import type { Elevation, Radius, Spacing, Typography } from './types';

/**
 * Non-colour primitives. These are intentionally skin-independent: a purchased
 * skin changes colours, not the rhythm of the layout.
 */

export const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius: Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const typography: Typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.2 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
};

/**
 * Restrained elevation. Shadows are deliberately soft — on dark skins we lean
 * on surface contrast instead, so these stay subtle enough to work in both.
 */
export const elevation: Elevation = {
  none: {},
  card: Platform.select({
    web: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)' },
    android: { elevation: 1 },
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
  }) as object,
  raised: Platform.select({
    web: { boxShadow: '0 6px 20px rgba(15, 23, 42, 0.12)' },
    android: { elevation: 4 },
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
  }) as object,
};
