import type { Skin } from '../types';

/**
 * The stock skin: a calm, high-contrast neutral palette with a single
 * confident accent. Dark is a designed palette (warm-neutral greys, lifted
 * surfaces) rather than an inversion of light.
 */
export const defaultSkin: Skin = {
  id: 'default',
  label: 'Default',
  colors: {
    light: {
      background: '#F7F8FA',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      surfaceMuted: '#EFF1F5',

      text: '#0F172A',
      textSecondary: '#4A5568',
      textMuted: '#8A94A6',

      primary: '#2563EB',
      onPrimary: '#FFFFFF',
      primarySoft: '#E4EDFF',

      border: '#E4E7EC',
      borderStrong: '#CDD3DC',

      danger: '#DC2626',
      onDanger: '#FFFFFF',
      success: '#16A34A',
      warning: '#D97706',

      overlay: 'rgba(15, 23, 42, 0.45)',
    },
    dark: {
      background: '#0E1116',
      surface: '#161A21',
      surfaceElevated: '#1D222B',
      surfaceMuted: '#232935',

      text: '#F2F4F8',
      textSecondary: '#A8B0BF',
      textMuted: '#6E7787',

      primary: '#5A8BFF',
      onPrimary: '#0B1220',
      primarySoft: '#1B2740',

      border: '#252B36',
      borderStrong: '#39414F',

      danger: '#F87171',
      onDanger: '#1A0B0B',
      success: '#4ADE80',
      warning: '#FBBF24',

      overlay: 'rgba(0, 0, 0, 0.6)',
    },
  },
};
