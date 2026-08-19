import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { makeStyles, useTheme } from '@/theme';

import type { WorkoutSummary } from '../types';

export type WorkoutCardProps = {
  workout: WorkoutSummary;
  variant?: 'default' | 'elevated';
  onPress?: () => void;
};

export function WorkoutCard({ workout, variant = 'default', onPress }: WorkoutCardProps) {
  const styles = useStyles();
  const theme = useTheme();

  const meta = [
    `${workout.exerciseCount} ${workout.exerciseCount === 1 ? 'exercise' : 'exercises'}`,
    workout.setCount > 0 ? `${workout.setCount} sets` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card variant={variant}>
        <View style={styles.row}>
          <View style={styles.main}>
            <Text variant="title" numberOfLines={1}>
              {workout.name}
            </Text>
            {workout.description ? (
              <Text variant="body" color="textSecondary" numberOfLines={2}>
                {workout.description}
              </Text>
            ) : null}
            <Text variant="caption" color="textMuted">
              {meta}
            </Text>
          </View>
          {onPress ? (
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md },
  main: { flex: 1, gap: t.spacing.xs },
}));
