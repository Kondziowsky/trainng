import { View, type ViewProps } from 'react-native';

import { makeStyles } from '@/theme';

export type CardProps = ViewProps & {
  /** `elevated` lifts the surface for primary content such as today's workout. */
  variant?: 'default' | 'elevated';
  padded?: boolean;
};

export function Card({ variant = 'default', padded = true, style, ...rest }: CardProps) {
  const styles = useStyles();
  return (
    <View
      {...rest}
      style={[
        styles.base,
        variant === 'elevated' ? styles.elevated : styles.flat,
        padded && styles.padded,
        style,
      ]}
    />
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
  flat: t.elevation.card,
  elevated: {
    backgroundColor: t.colors.surfaceElevated,
    ...t.elevation.raised,
  },
  padded: {
    padding: t.spacing.lg,
  },
}));
