import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { makeStyles, useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export function LoadingState({ label }: { label?: string }) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.centered} accessibilityRole="progressbar">
      <ActivityIndicator color={theme.colors.primary} />
      {label ? (
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

export type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon = 'sparkles-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.centered}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={26} color={theme.colors.textMuted} />
      </View>
      <Text variant="heading" style={styles.center}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color="textSecondary" style={styles.center}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const styles = useStyles();
  const theme = useTheme();
  return (
    <View style={styles.centered}>
      <Ionicons name="alert-circle-outline" size={28} color={theme.colors.danger} />
      <Text variant="heading" style={styles.center}>
        Something went wrong
      </Text>
      <Text variant="body" color="textSecondary" style={styles.center}>
        {message}
      </Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing.md,
    paddingVertical: t.spacing.xxl,
    paddingHorizontal: t.spacing.lg,
  },
  center: { textAlign: 'center' },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: t.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.colors.surfaceMuted,
  },
}));
