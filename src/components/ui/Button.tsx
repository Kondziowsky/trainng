import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Optional leading element, typically an icon. */
  icon?: React.ReactNode;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const styles = useStyles();
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const textColor =
    variant === 'primary' ? 'onPrimary' : variant === 'danger' ? 'onDanger' : 'text';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors[textColor]} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text variant="bodyStrong" color={textColor}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing.sm,
  },
  fullWidth: { alignSelf: 'stretch' },
  sm: { paddingVertical: t.spacing.sm, paddingHorizontal: t.spacing.md },
  md: { paddingVertical: t.spacing.md, paddingHorizontal: t.spacing.lg },
  lg: { paddingVertical: t.spacing.lg, paddingHorizontal: t.spacing.xl },
  primary: { backgroundColor: t.colors.primary },
  secondary: { backgroundColor: t.colors.surfaceMuted, borderColor: t.colors.border },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: t.colors.danger },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
}));
