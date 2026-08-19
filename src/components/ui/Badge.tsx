import { View, type ViewProps } from 'react-native';

import { makeStyles } from '@/theme';

import { Text } from './Text';

export type BadgeProps = ViewProps & {
  label: string;
  tone?: 'neutral' | 'primary';
};

export function Badge({ label, tone = 'neutral', style, ...rest }: BadgeProps) {
  const styles = useStyles();
  return (
    <View style={[styles.base, tone === 'primary' ? styles.primary : styles.neutral, style]} {...rest}>
      <Text variant="caption" color={tone === 'primary' ? 'primary' : 'textSecondary'}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: t.spacing.md,
    paddingVertical: 5,
    borderRadius: t.radius.full,
  },
  neutral: { backgroundColor: t.colors.surfaceMuted },
  primary: { backgroundColor: t.colors.primarySoft },
}));
