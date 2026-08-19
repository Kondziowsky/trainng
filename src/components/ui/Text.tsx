import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type ColorTokens, type TypographyVariant } from '@/theme';

type ColorToken = Extract<
  keyof ColorTokens,
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'primary'
  | 'onPrimary'
  | 'danger'
  | 'onDanger'
  | 'success'
  | 'warning'
>;

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
};

/**
 * The only component allowed to render raw text. Everything picks a typography
 * variant and a semantic colour token, so a skin change repaints the whole app.
 */
export function Text({ variant = 'body', color = 'text', style, ...rest }: TextProps) {
  const theme = useTheme();
  return (
    <RNText
      {...rest}
      style={[theme.typography[variant], { color: theme.colors[color] }, style]}
    />
  );
}
