import type { TextStyle } from 'react-native';

/**
 * Semantic colour tokens.
 *
 * Components MUST only ever consume tokens from this list — never a raw hex
 * value. That is what makes a new skin (light/dark variant, or a future
 * purchasable theme) a pure data change instead of a UI rewrite.
 */
export type ColorTokens = {
  /** App canvas. */
  background: string;
  /** Default card / sheet surface sitting on the canvas. */
  surface: string;
  /** A surface that needs to read as "lifted" above `surface`. */
  surfaceElevated: string;
  /** Quiet fill for chips, inputs, skeletons. */
  surfaceMuted: string;

  text: string;
  textSecondary: string;
  textMuted: string;

  primary: string;
  /** Content colour placed on top of `primary`. */
  onPrimary: string;
  /** Tinted primary wash for badges/selected states. */
  primarySoft: string;

  border: string;
  borderStrong: string;

  danger: string;
  onDanger: string;
  success: string;
  warning: string;

  /** Scrim behind modals. */
  overlay: string;
};

export type ColorScheme = 'light' | 'dark';

/** User preference. `system` follows the OS setting. */
export type ThemeMode = ColorScheme | 'system';

/**
 * A skin is a named pair of light/dark colour maps.
 *
 * Adding "Midnight", "Neon", etc. later means adding one file that exports a
 * `Skin` and registering it — no component changes.
 */
export type Skin = {
  id: string;
  /** Human readable name, shown in Settings. */
  label: string;
  colors: Record<ColorScheme, ColorTokens>;
};

export type Spacing = Readonly<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number>>;
export type Radius = Readonly<Record<'sm' | 'md' | 'lg' | 'xl' | 'full', number>>;

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption';

export type Typography = Readonly<Record<TypographyVariant, TextStyle>>;

export type Elevation = Readonly<{
  none: object;
  card: object;
  raised: object;
}>;

/** The object every component reads via `useTheme()`. */
export type Theme = {
  skinId: string;
  scheme: ColorScheme;
  colors: ColorTokens;
  spacing: Spacing;
  radius: Radius;
  typography: Typography;
  elevation: Elevation;
};
